/*
 * Core
 */
import React, { Component } from 'react';
import styled from 'styled-components';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider, Query, Mutation } from "react-apollo";
import { WebSocketLink } from "apollo-link-ws";
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

/*
 * Components
 */
// import { Preloader } from './components/Preloader';
import { Error } from './components/Error';
import Chatbox from './components/Chatbox';
import { Input } from './components/Input';
import { Button } from './components/Button';

/*
 * Queries
 */
import {
	QUERY_GET_LOGINS,
	MUTATION_GET_LOGINS,
	SEND_MESSAGE_MUTATION
} from './queries';

const wsLink = new WebSocketLink({
	uri: process.env.REACT_APP_API_WS_URI,
	options: {
		reconnect: true
	}
});

const httpLink = new HttpLink({
	uri: process.env.REACT_APP_API_HTTP_URI,
});

const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query)
		return kind === 'OperationDefinition' && operation === 'subscription'
	},
	wsLink,
	httpLink
);

const client = new ApolloClient({
	link,
	cache: new InMemoryCache(),
	connectToDevTools: true
});

const Wrapper = styled.div`
	height: 100%;
	background: #0F5672;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const Title = styled.h1`
	font-size: 32px;
	color: #ffffff;
`;

const Container = styled.div`
	padding: 40px;
	width: 580px;
	box-sizing: border-box;
	background: #f7f7f7;
	border-radius: 8px;
`;

const Logout = styled.div`
	display: inline-block;
	text-decoration: underline;
	font-size: 18px;
	&:hover {
		cursor: pointer;
		text-decoration: none;
	}
`;

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			logedIn: false,
			error: false,
			errorMessage: ""
		};
	}

	logOut() {
		client.mutate({
			mutation: SEND_MESSAGE_MUTATION,
			variables: { from: "System", message: localStorage.getItem("name") + " has left this awesome chat!" }
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

		if (logedIn || storedNickname) {
			if(!storedNickname){
				localStorage.setItem('name', name);
			}
	
			return (
				<ApolloProvider client={client}>
					<Wrapper>
						<Title>Uchat <Logout onClick={() => this.logOut()}>Logout</Logout></Title>
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
							<Mutation mutation={MUTATION_GET_LOGINS}>
								{(addLogin, { data }) => (
									<div>
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
													if (login.name === name) {
														return true;
													} else {
														return false;
													}
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
									</div>
								)}
							</Mutation>
						</Container>
					</Wrapper>
				</ApolloProvider>
			);
		}
	}
}

export default App;