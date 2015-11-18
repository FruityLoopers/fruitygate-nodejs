import React from 'react';
import MeshDashboard from './meshDashboard.jsx';
import MessageSender from './messageSender.jsx';
import NodeConfiguration from './nodeConfiguration.jsx';

export default class Main extends React.Component {
  render(){
    return <div>
      <a href="/votes">VIEW ALL VOTES</a>
      <br/><br/>
      <a href="/boxes">VIEW BOX CONFIGURATIONS</a>
      <br/><br/>
      <form action="/sendVotes" method="post">
        <button>Send Votes</button>
      </form>

      <MeshDashboard nodes={this.props.nodes}/>
      <NodeConfiguration />
    </div>;
  }
}
