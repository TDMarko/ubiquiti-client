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

export const QUERY_GET_MESSAGES = gql`
	{
		getMessages {
			id,
			from,
			message
		}
	}
`;

export const MUTATION_LOGIN = gql`
	mutation SendLoginMutation($name: String!) {
		logIn(
			name: $name,
		) {
			name
		}
	}
`;

export const MUTATION_SEND_MESSAGE = gql`
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

export const SUBSCRIPTION_SEND_MESSAGE = gql`
	subscription MessageSentSubscription {
		messageSent {
			id
			from
			message
		}
	}
`;
