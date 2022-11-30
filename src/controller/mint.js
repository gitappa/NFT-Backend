
const utilsCall = require("./utils")
const dotenv = require('dotenv');
dotenv.config();
const {AccountId,Client,PrivateKey,TokenCreateTransaction,TokenMintTransaction,TokenSupplyType,TokenType,TransferTransaction} = require("@hashgraph/sdk")
async function tokenMinterFcn(tokenId, CID, client, supplyKey) {
	console.log(`\n=======================================`);
	console.log(`- Minting new NFT...`);

	// Mint new NFT
	let mintTx = await new TokenMintTransaction()
		.setTokenId(tokenId)
		.setMetadata([Buffer.from(CID)])
		.freezeWith(client);

	//Sign the transaction with the supply key
	let mintTxSign = await mintTx.sign(supplyKey);

	//Submit the transaction to a Hedera network
	let mintTxSubmit = await mintTxSign.execute(client);

	//Get the transaction receipt
	let mintRx = await mintTxSubmit.getReceipt(client);

	return mintRx;
}
//Create the NFT
const createNFT = async (client, treasuryId, supplyKey, treasuryKey) => {
	const tokenName = "Unthink Influencer";
	const tokenSymbol = "UNTHINK";
	//Create the Token
	let nftCreate = await new TokenCreateTransaction()
		.setTokenName(tokenName) 
		.setTokenSymbol(tokenSymbol) 
		.setTokenType(TokenType.NonFungibleUnique)
		.setDecimals(0)
		.setInitialSupply(0)
		.setTreasuryAccountId(treasuryId)
		.setSupplyType(TokenSupplyType.Finite)
		.setMaxSupply(2000000)
		.setSupplyKey(supplyKey)
		.freezeWith(client);

	//Sign the transaction with the treasury key
	let nftCreateTxSign = await nftCreate.sign(treasuryKey);

	//Submit the transaction to a Hedera network
	let nftCreateSubmit = await nftCreateTxSign.execute(client);

	//Get the transaction receipt
	let nftCreateRx = await nftCreateSubmit.getReceipt(client);

	//Get the token ID
	let tokenId = nftCreateRx.tokenId;

	//Log the token ID
	console.log(`- Created NFT with Token ID: ${tokenId} \n`);

	return tokenId;
};



async function createAndMitNFT(req,res){
    console.log("...invoked createAndMitNFT...")
	var missing_field =""
	var query ={}
	const dateIssue = utilsCall.getDateIssue();
	var metadata = {
		"creator": "Unthink Creator",
        "image": "https://s3.us-west-1.amazonaws.com/cem.3816.img/unthink_main/trophy+image.png",
		"type": "image/png",
		"properties": {
			"event": "Joined the Unthink creator community",
			"date": dateIssue,
			"website": "https://unthink.ai"
		}
	} 
    var response={
        "status":"failure",
        "status_code" :400
    }
	try{
        if(req.body.user_id){
            query["user_id"]=req.body.user_id
        }else{
            missing_field = "user_id"
        }
        if(req.body.type){
            query["type"] = req.body.type
        }else{
            missing_field = "type"
        }
		metadata["name"] = req.body.metadata_name || "Unthink Creator"
		metadata["description"] = req.body.metadata_description || "Joined the Unthink creator community"
    	if (missing_field){
			response["status_desc"] = `missing field ${missing_field}`
			res.json(response)
			return;
		}

		//Grab Hedera account ID and private key from your .env file
		const myAccountId = process.env.MAIN_ACCOUNT_ID; 
		const myPrivateKey = process.env.MAIN_PRIVATE_KEY; 

		const accountId = AccountId.fromString(myAccountId);
		const operatorKey = PrivateKey.fromString(myPrivateKey);

		const client = Client.forMainnet(); // For Production

		client.setOperator(myAccountId, myPrivateKey);
		//const tokenId = await createNFT(client, accountId, operatorKey, operatorKey);
		const tokenId = process.env.MAIN_TOKEN_ID
		const CID =
			"https://s3.us-west-1.amazonaws.com/yfret.3816.integrations/venly/metadata-1.json"; 

		const mintRx = await tokenMinterFcn(tokenId, CID, client, operatorKey);
		console.log(`Created NFT ${tokenId} with serial: ${mintRx.serials[0].low}`); 

		//Get AliceID dynamically with the user id from UI
		const aliceID = await utilsCall.getAliceId(query["user_id"])
		
		// Transfer the NFT from treasury to Alice
		// Sign with the treasury key to authorize the transfer
		let tokenTransferTx = await new TransferTransaction()
			.addNftTransfer(tokenId, mintRx.serials[0].low, accountId, aliceID)
			.freezeWith(client)
			.sign(operatorKey);

		let tokenTransferSubmit = await tokenTransferTx.execute(client);
		let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

		console.log(
			`\n- NFT transfer from Treasury to ${aliceID}: ${tokenTransferRx.status} \n`
		);
		response["status"] = "success"
        response["status_code"] = 200
		response["status_desc"] = `NFT transfer from Treasury to ${aliceID}: ${tokenTransferRx.status}`
		res.json(response);
	}catch (err) {
		//exception err to be sent with 500 code
		console.error(err);
		response["status_desc"] = `exception: ${err}`
        response["status_code"] = 500
		res.json(response);
	}

};

module.exports = {createAndMitNFT};
