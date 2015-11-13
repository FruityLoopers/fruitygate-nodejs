import React from 'react';
import MeshDashboard from './meshDashboard.jsx';
import MessageSender from './messageSender.jsx';

export default class Main extends React.Component {
  render(){
    return <div>
      <a href="/votes">VIEW ALL VOTES</a>
      <br/><br/>
      <a href="/boxes">VIEW BOX CONFIGURATIONS</a>
      <br/><br/>
      <button>Send Votes</button>
      <MeshDashboard nodes={this.props.nodes}/>
      <MessageSender/>
    </div>;
  }
}
