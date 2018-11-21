import React, { Component } from "react";
import * as Web3 from "web3";
//import { abi: contractAbi, networks: contractNetwork } from "./contracts/SMARTCONTRACT.json";
import { Alert, AlertContainer } from "react-bs-notifier";
//import { BigNumber } from "bignumber.js";
const promisify = require("tiny-promisify");

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			accounts: [],
			showAlert: false,
			alertContent: "",
			//contractName: null,
			intervalId: undefined
		};
	}

	async componentDidMount() {
		try {
			const web3 = await this.connectToWeb3();
			await this.verifyNetwork(web3);
			const accounts = await this.getAccounts(web3);
			//const contractName = web3.eth.contract(contractAbi).at(contractNetwork[1].address);
			const intervalId = setInterval(async () => {
				await this.checkAccount(web3, accounts);
			}, 1000);

			this.setState({
				accounts,
				//contractName,
				intervalId
			});
		} catch (e) {
			this.setState({ showAlert: true, alertContent: e.message });
		}
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	async connectToWeb3() {
		let web3;

		if (typeof window.web3 !== "undefined") {
			web3 = await new Web3(window.web3.currentProvider);
		} else {
			web3 = await new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
		}

		if (web3.isConnected()) {
			return web3;
		} else {
			throw new Error(
				"Make sure you are using a Web3-enabled browser and connecting to the appropriate Ethereum network, and that your account is unlocked"
			);
		}
	}

	async verifyNetwork(web3) {
		const networkId = await promisify(web3.version.getNetwork)();
		if (parseInt(networkId, 10) === 4) {
			return true;
		} else {
			throw new Error("The SOMETHING smart contract is not available on the Ethereum network you're currently connected to");
		}
	}

	async getAccounts(web3) {
		const accounts = await promisify(web3.eth.getAccounts)();
		if (accounts.length) {
			return accounts;
		} else {
			throw new Error("Unable to find an active account on the Ethereum network you're currently connected to");
		}
	}

	async checkAccount(web3, accounts) {
		if (!web3 || !accounts) {
			return;
		}
		const latestAccounts = await promisify(web3.eth.getAccounts)();
		if ((latestAccounts.length && accounts.length && latestAccounts[0] !== accounts[0]) || latestAccounts.length !== accounts.length) {
			window.location.reload();
		}
	}

	render() {
		const { accounts, showAlert, alertContent } = this.state;
		return (
			<div className="App">
				<header className="App-header">Welcome, {accounts.length ? accounts[0] : ""}</header>
				<AlertContainer position="top-right">
					{showAlert ? (
						<Alert type="danger" headline="Oops!">
							{alertContent}
						</Alert>
					) : null}
				</AlertContainer>
			</div>
		);
	}
}

export default App;
