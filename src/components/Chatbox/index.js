/*
 * Core
 */
import React, { Component, Fragment } from 'react';

/*
 * Apollo
 */
import { Query, Mutation } from "react-apollo";
import { animateScroll } from "react-scroll";

/*
 * Components
 */
import { Box } from './Box';
import { Avatar } from './Avatar';
import { Message } from './Message';
import { Text } from './Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Preloader } from '../../components/Preloader';
import { Error } from '../../components/Error';

/*
 * Queries
 */
import { 
	QUERY_GET_MESSAGES, 
	MUTATION_SEND_MESSAGE, 
	SUBSCRIPTION_SEND_MESSAGE 
} from '../../queries';

let subscriptionMessage = null;

const MessagesContainer = () => (
	<Query query={QUERY_GET_MESSAGES}>
		{({ data, loading, error, subscribeToMore }) => {
			if (!data) {
				return null;
			}
			if (loading) {
				return <Preloader />;
			}
			if (error) { 
				return <Error>Sorry, something went wrong!</Error>;
			}

			if (!subscriptionMessage) {
				subscriptionMessage = subscribeToMore({
				  document: SUBSCRIPTION_SEND_MESSAGE,
				  updateQuery: (prev, { subscriptionData }) => {
					if (!subscriptionData.data) {
					  return prev;
					}

					const newMessage = subscriptionData.data.messageSent;

					return {
						...prev,
						getMessages: [...prev.getMessages, newMessage]
					}
				  }
				});
			}

			return <MessageList props={data.getMessages} />
		}}
	</Query>
);

const MessageList = (props) => {
	scrollToBottom();

	return (
		props.props.map((chat, index) => (
			<Message key={index}>
				<Avatar>{chat.from.substring(0, 1)}</Avatar>
				<Text>{chat.from}: {chat.message}</Text>
			</Message>
		))
	)
}

// TODO: this is buddy, probably event bubbling issue
const scrollToBottom = () => {
	animateScroll.scrollToBottom({
		containerId: "chatBox"
	});
}

class Chatbox extends Component {
	state = {
		from: "",
		message: "",
		error: false
	}

	render() {
		const { from, message } = this.state;
		let input;

		return (
			<Fragment>
				<Box id="chatBox">
					{MessagesContainer()}
				</Box>
				{this.state.error && <Error>Please enter any message!</Error>}
				<Mutation mutation={MUTATION_SEND_MESSAGE}>
					{(sendMessage) => (
						<Fragment>
							<form onSubmit={e => {
									e.preventDefault();
									this.setState({ error: false });

									if (input.value.length === 0) {
										this.setState({ error: true });

										return false;
									}

									sendMessage({ variables: { from: from, message: message } });
									this.setState({ message: "" });
								}}>
								<Input 
									placeholder="Enter a message to send" 
									value={message}
									ref={node => { input = node }}
									onChange={e => this.setState({ from: localStorage.getItem('name'), message: e.target.value })} />
								<Button type="submit">Send</Button>
							</form>
						</Fragment>
					)}
				</Mutation>
			</Fragment>
		);
	}
}

export default Chatbox;