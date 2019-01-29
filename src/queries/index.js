/*
 * Core
 */
import gql from "graphql-tag";

export const QUERY_GET_LOGINS = gql`
	{
		getLogins {
			name
		}
	}
`;

export const MUTATION_GET_LOGINS = gql`
	mutation SendMessageMutation($name: String!) {
		logIn(
			name: $name,
		) {
			name
		}
	}
`;

export const QUERY_GET_MESSAGES = gql `
	{
		getMessages {
			id,
			from,
			message
		}
	}
`;

export const SEND_MESSAGE_MUTATION = gql`
	mutation SendMessageMutation($from: String!, $message: String!) {
		sendMessage(
			from: $from,
			message: $message
		) {
			id
			from
			message
		}
	}
`;

export const SEND_MESSAGE_SUB = gql`
	subscription MessageSentSubscription {
		messageSent {
			id
			from
			message
		}
	}
`;