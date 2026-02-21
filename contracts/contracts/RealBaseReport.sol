// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RealBaseReport
 * @notice ERC-721 NFT representing a neighborhood analysis snapshot.
 *         Metadata stored on IPFS includes school ratings, crime stats,
 *         transit scores, affordability analysis, and a timestamp.
 */
contract RealBaseReport is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Fee for public minting
    uint256 public mintPrice = 0.001 ether;

    // Agent address (can mint for free)
    address public agent;

    // Total revenue from mints
    uint256 public totalRevenue;

    // zipcode => latest report token ID
    mapping(uint32 => uint256) public latestReport;

    event ReportMinted(
        uint256 indexed tokenId,
        uint32 indexed zipcode,
        address indexed minter,
        string tokenURI
    );
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner(), "Not agent");
        _;
    }

    constructor(address _agent)
        ERC721("RealBase Report", "RBR")
        Ownable(msg.sender)
    {
        agent = _agent;
    }

    /**
     * @notice Agent mints a report for free.
     * @param to Recipient address
     * @param zipcode Neighborhood zipcode
     * @param uri IPFS URI for metadata JSON
     */
    function agentMint(
        address to,
        uint32 zipcode,
        string calldata uri
    ) external onlyAgent returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        latestReport[zipcode] = tokenId;

        emit ReportMinted(tokenId, zipcode, to, uri);
        return tokenId;
    }

    /**
     * @notice Public mint — anyone can mint a report for a fee.
     * @param zipcode Neighborhood zipcode
     * @param uri IPFS URI for metadata JSON
     */
    function publicMint(
        uint32 zipcode,
        string calldata uri
    ) external payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");

        totalRevenue += msg.value;

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        latestReport[zipcode] = tokenId;

        emit ReportMinted(tokenId, zipcode, msg.sender, uri);
        return tokenId;
    }

    /**
     * @notice Update mint price. Only owner.
     */
    function setMintPrice(uint256 _price) external onlyOwner {
        emit MintPriceUpdated(mintPrice, _price);
        mintPrice = _price;
    }

    /**
     * @notice Update agent address. Only owner.
     */
    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
    }

    /**
     * @notice Withdraw accumulated revenue. Only owner.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner()).transfer(balance);
    }

    /**
     * @notice Get total supply of minted reports.
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    // Required overrides for ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
