// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Tgether is Ownable, ReentrancyGuard, Pausable, ChainlinkClient{
        AggregatorV3Interface internal priceFeed;
        using Chainlink for Chainlink.Request;



        address private oracle;
        uint256 private fee;
        uint256 private tgetherfee;

        address private adapterAddress;
        event AppFeeChanged(uint fee);

        mapping (string=> address payable ) public unverifiedPayoutAddresses;
        mapping (string=> address payable ) public verifiedPayoutAddresses;
        mapping (bytes32=> string ) public PayoutUser;
        mapping (bytes32=> uint ) public PayoutAmount;
        mapping (bytes32=> string ) public PayoutBackToUser;
        mapping (bytes32=> string ) public PayoutToRecipient;




        uint256 constant private ORACLE_PAYMENT = 1 * LINK_DIVISIBILITY;



        /// Need function to set job id and oracle

        constructor() {
        setPublicChainlinkToken();
        oracle = 0x05c0928f481e9993f33Dc0Af0f1372d08A3A3873;
        adapterAddress = 0x05c0928f481e9993f33Dc0Af0f1372d08A3A3873;
        setChainlinkOracle(oracle);
        priceFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
        // Multiplied by 10000 so percent is 99.95 paid out to the user .05% fee
        tgetherfee = 9995 ;
        fee = 1 * 10 ** 5; // (Varies by network and job)

        }

        // https://docs.chain.link/docs/get-the-latest-price/

            function getLatestPrice() public view returns (int) {
                (
                /*uint80 roundID*/,
                int price,
                /*uint startedAt*/,
                /*uint timeStamp*/,
                /*uint80 answeredInRound*/
                ) = priceFeed.latestRoundData();
                return price;
        }

        // Setter Functions
        function setOracle(address _oracle) external onlyOwner {
                oracle = _oracle;
                }



        function PayIn( string memory  _username, string memory  _recipientusername, uint _orderId) public payable  whenNotPaused  {
                bytes32 PayInjobId = "00ddb5a003644157a89d729da19ca83d";

                Chainlink.Request memory req = buildChainlinkRequest(PayInjobId, address(this), this.fulfill.selector);
                req.add("username", _username );
                req.add("orderId", Strings.toString(_orderId)) ;
                req.add("priceData", Strings.toString(uint(getLatestPrice())));
                req.add("value", Strings.toString(msg.value));
                bytes32 requestId =sendChainlinkRequest(req, fee ); 
                PayoutAmount[requestId] =  msg.value * tgetherfee / 10000; 
                PayoutBackToUser[requestId] =  _username;
                PayoutToRecipient[requestId] =  _recipientusername;
                
        }


        // The only External Adapter modifier is used to ensure the payout function can only be done by our chainlink nodes

        modifier onlyNode() {
                require(msg.sender == adapterAddress); 
        _;                              
        }
        event transactionSuccess(bool _paymentSucceded);
        function fulfill(bytes32 requestId, bool _isSuccess) public onlyNode recordChainlinkFulfillment(requestId){
                if (_isSuccess== true){
                verifiedPayoutAddresses[PayoutToRecipient[requestId]].transfer(PayoutAmount[requestId]);
                }
                else{
                verifiedPayoutAddresses[PayoutBackToUser[requestId]].transfer(PayoutAmount[requestId]);

                }
        }



        

        function setPayout( string memory _username, address _payoutad) whenNotPaused public {

                //  we first must check if the username, address matches what the user requested
                // chainlink call -> we need to make sure the user actually meant to do this

                bytes32 settingsjobId = "113c01aacf5949d8bb54d84b54029b0d";
                if (_payoutad == msg.sender){
                unverifiedPayoutAddresses[_username] = payable(_payoutad);
                Chainlink.Request memory req = buildChainlinkRequest(settingsjobId, address(this), this.payoutFulfill.selector);
                req.add("username", _username );
                req.add("address", Strings.toHexString(uint256(uint160(msg.sender)), 20) );
                bytes32 requestId = sendChainlinkRequest(req, fee);
                PayoutUser[requestId] = _username;
                }

        }


        event setPayoutSuccess(bool _paymentSucceded);
        function payoutFulfill(bytes32 _requestId, bool _isSuccess) public recordChainlinkFulfillment(_requestId){
                if (_isSuccess == true){
                verifiedPayoutAddresses[PayoutUser[_requestId]] = unverifiedPayoutAddresses[PayoutUser[_requestId]];
                }
                emit setPayoutSuccess(_isSuccess);
        }




        /* Utility Functions */

        
        function updateAppFee(uint newFee) external onlyOwner {
                fee = newFee;
                emit AppFeeChanged(newFee);
                }
        function updateTgetherFee(uint newFee) external onlyOwner {
                tgetherfee = newFee;
                }

        function pause() external nonReentrant onlyOwner {
                _pause();
        }

        function unpause() external nonReentrant onlyOwner {
                _unpause();
        }


        // Contract is still a proof of concept, this will be removed in the future

        function withdrawLink() onlyOwner external {
        LinkTokenInterface linkToken = LinkTokenInterface(chainlinkTokenAddress());
        require(linkToken.transfer(msg.sender, linkToken.balanceOf(address(this))), "Unable to transfer");
        }




    }