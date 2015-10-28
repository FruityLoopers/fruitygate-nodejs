import React from 'react';

export default class MessageSender extends React.Component {
  render(){
    return <form action="#">
      Target node ID: <input id="targetNodeId" maxLength="5" autoComplete="off"/>
      Message: <input id="message" maxLength="10" autoComplete="off"/>
      <button>Send</button>
    </form>;
  }
}
