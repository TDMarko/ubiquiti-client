#Test assignemnt for Ubiquiti Networks - Client part

Simple live chat application.
Server part can be found here: https://github.com/TDMarko/ubiquiti-server

P.S. this is first time I use GraphQL and Apollo. Used this task as a reason to try it :)

##Build with
- ReactJS
- Styled-components
- Apollo Client
- GraphQL
- Love ❤️

##Requirements
- Node
- Git
- Yarn, if you like it more

##Intallation
```
npm install
npm start
```
.env file at root directory containing host names with following constants
```
REACT_APP_API_WS_URI=ws://localhost:4000/graphql
REACT_APP_API_HTTP_URI=http://localhost:4000/
```

!NB: don't forget to run server part ;) 

##Todo
- Add 'Disconnected due to innactivty' and 'Server unvailable' messages
- Make some fancy nancy animations
- Fix chat scroll down animation