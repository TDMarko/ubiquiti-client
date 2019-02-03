/*
 * Core
 */
import React, { Component, Fragment } from 'react';
import IdleTimer from 'react-idle-timer';

/*
 * Apollo
 */
import { ApolloClient } from 'apollo-client';
import { ApolloProvider, Mutation } from "react-apollo";
import { WebSocketLink } from "apollo-link-ws";
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

/*
 * Components
 */
import { Title, Container, Logout } from './components/App';
import { Wrapper } from './components/Wrapper';
import { Error } from './components/Error';
import { Input } from './components/Input';
import { Button } from './components/Button';
import Chatbox from './components/Chatbox';

/*
 * Queries
 */
import {
	QUERY_GET_LOGINS,
	MUTATION_LOGIN,
	MUTATION_SEND_MESSAGE
} from './queries';

// TODO: move this links to some configuration file
const linkWs = new WebSocketLink({
	uri: process.env.REACT_APP_API_WS_URI,
	options: {
		reconnect: true
	}
});

const linkHttp = new HttpLink({
	uri: process.env.REACT_APP_API_HTTP_URI,
});

const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query)
		return kind === 'OperationDefinition' && operation === 'subscription'
	},
	linkWs,
	linkHttp
);

const client = new ApolloClient({
	link,
	cache: new InMemoryCache(),
	connectToDevTools: true
});

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			logedIn: false,
			error: false,
			errorMessage: ""
		};

		this.onIdleLogout = this.onIdleLogout.bind(this)
	}

	// TODO: fix issue with mandatory reload
	logOut(reason) {
		client.mutate({
			mutation: MUTATION_SEND_MESSAGE,
			variables: { from: "System", message: localStorage.getItem("name") + reason }
		}).then(() => {
			localStorage.clear('name');
			this.setState({ logedIn: false });
			window.location.reload();
		})
	};

	render() {
		const { name, logedIn } = this.state;
		const storedNickname = localStorage.getItem('name');
		let input;

		// TODO: can be moved to sepparate component for remove code dublication
		if (logedIn || storedNickname) {
			if(!storedNickname){
				localStorage.setItem('name', name);
			}
	
			return (
				<ApolloProvider client={client}>
					<Wrapper>
						<Title>Uchat <Logout onClick={() => this.logOut(" has left this awesome chat!")}>Logout</Logout></Title>
						<IdleTimer
							ref={ref => { this.idleTimer = ref }}
							element={document}
							onIdle={this.onIdleLogout}
							debounce={250}
							timeout={process.env.REACT_APP_INACTIVITY_TIMER} />
						<Container>
							<Chatbox />
						</Container>
					</Wrapper>
				</ApolloProvider>
			);
		}
		else {
			return (
				<ApolloProvider client={client}>
					<Wrapper>
						<Title>Uchat</Title>
						<Container>
							{this.state.error && <Error>{this.state.errorMessage}</Error>}
							{/* TODO: add preloader here when checking for login */}
							<Mutation mutation={MUTATION_LOGIN}>
								{(addLogin) => (
									<Fragment>
										<form onSubmit={e => {
											e.preventDefault();
											this.setState({ error: false });

											if (input.value.length < 4) {
												this.setState({ 
													error: true,
													errorMessage: "Nickname length must be at least 4 symbols!"
												});

												return false;
											}

											// TODO: pass param to query, returning whole list is wrong
											client.query({
												query: QUERY_GET_LOGINS
											}).then(response => {
												const isLoginUsed = response.data.getLogins.some(login => {
													return login.name === name;
												})

												if (isLoginUsed) {
													this.setState({ 
														error: true,
														errorMessage: "Login is in use!"
													});
												} else {
													addLogin({ variables: { name: name } });
													this.setState({ logedIn: true });
												}
											})
										}}>
											<Input
												placeholder="Please, enter your nickname" 
												onChange={e => this.setState({ name: e.target.value })}
												ref={node => { input = node }}
											/>
											<Button type="submit">Login</Button>
										</form>
									</Fragment>
								)}
							</Mutation>
						</Container>
					</Wrapper>
				</ApolloProvider>
			);
		}
	}
	
	onIdleLogout() {
		this.logOut(" has left due to inactivity!");
	}
}

export default App;