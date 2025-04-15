// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

/**
 * @title YourLSP7Token
 * @dev Simplified LSP7-compatible token without complex inheritance
 */
contract YourLSP7Token {
    string private _name;
    string private _symbol;
    address private _owner;
    
    // Mapping from account to balance
    mapping(address => uint256) private _balances;
    
    // Mapping from account to operator approvals (address => operator => amount)
    mapping(address => mapping(address => uint256)) private _operatorAuthorizations;
    
    // LSP7 and ERC165 Interface IDs
    bytes4 private constant _INTERFACE_ID_LSP7 = 0xe33f65c3;
    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;
    
    // Events as defined in LSP7
    event Transfer(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 amount,
        bool force,
        bytes data
    );
    
    event AuthorizedOperator(
        address indexed operator,
        address indexed tokenOwner,
        uint256 amount
    );
    
    event RevokedOperator(address indexed operator, address indexed tokenOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == _owner, "LSP7: caller is not the owner");
        _;
    }
    
    constructor(string memory name_, string memory symbol_, address owner_) {
        _name = name_;
        _symbol = symbol_;
        _owner = owner_;
        
        // Mint initial supply to token owner
        // 1000 tokens with 18 decimals
        _mint(owner_, 1000 * 10**18, true, "");
    }
    
    // Basic view functions
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function owner() public view returns (address) {
        return _owner;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function authorizedAmountFor(address operator, address tokenOwner) public view returns (uint256) {
        return _operatorAuthorizations[tokenOwner][operator];
    }
    
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return 
            interfaceId == _INTERFACE_ID_LSP7 ||
            interfaceId == _INTERFACE_ID_ERC165;
    }
    
    // LSP7 interface functions
    
    // Authorize an operator to spend tokens
    function authorizeOperator(address operator, uint256 amount) public {
        require(operator != address(0), "LSP7: operator cannot be zero address");
        require(msg.sender != operator, "LSP7: authorizing self as operator");
        
        _operatorAuthorizations[msg.sender][operator] = amount;
        
        emit AuthorizedOperator(operator, msg.sender, amount);
    }
    
    // Revoke operator authorization
    function revokeOperator(address operator) public {
        require(operator != address(0), "LSP7: operator cannot be zero address");
        
        delete _operatorAuthorizations[msg.sender][operator];
        
        emit RevokedOperator(operator, msg.sender);
    }
    
    // LSP7 transfer function
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        require(to != address(0), "LSP7: transfer to zero address");
        require(amount > 0, "LSP7: transfer amount cannot be zero");
        
        if (from == msg.sender) {
            // Transferring own tokens
            require(_balances[from] >= amount, "LSP7: insufficient balance");
            _balances[from] -= amount;
            _balances[to] += amount;
        } else {
            // Transferring as operator
            require(_operatorAuthorizations[from][msg.sender] >= amount, "LSP7: insufficient authorization");
            require(_balances[from] >= amount, "LSP7: insufficient balance");
            
            _operatorAuthorizations[from][msg.sender] -= amount;
            _balances[from] -= amount;
            _balances[to] += amount;
        }
        
        emit Transfer(msg.sender, from, to, amount, force, data);
    }
    
    // LSP7 transferFrom function (for backwards compatibility)
    function transferFrom(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        require(_operatorAuthorizations[from][msg.sender] >= amount, "LSP7: insufficient authorization");
        
        _operatorAuthorizations[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, from, to, amount, force, data);
    }
    
    // Function to mint new tokens (only owner can call this)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount, true, "");
    }
    
    // Function to burn tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount, "");
    }
    
    // Internal functions
    function _mint(address to, uint256 amount, bool force, bytes memory data) internal {
        require(to != address(0), "LSP7: mint to zero address");
        
        _balances[to] += amount;
        
        emit Transfer(msg.sender, address(0), to, amount, force, data);
    }
    
    function _burn(address from, uint256 amount, bytes memory data) internal {
        require(_balances[from] >= amount, "LSP7: burn amount exceeds balance");
        
        _balances[from] -= amount;
        
        emit Transfer(msg.sender, from, address(0), amount, true, data);
    }
}
