import React from 'react';
import MeshDashboard from './meshDashboard.jsx';
import MessageSender from './messageSender.jsx';

export default class Main extends React.Component {
  render(){
    return <div>
      <MeshDashboard nodes={this.props.nodes}/>
      <MessageSender/>
    </div>;
  }
}
