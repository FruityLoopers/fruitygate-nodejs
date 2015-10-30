import React from 'react';

export default class NodeCard extends React.Component {
  render(){
    const node = this.props.node;
    const lastSeenInSecs = ((new Date() - node.lastSeen)/1000).toFixed(2);
    const cardStyle = {
      backgroundColor: this.backgroundColor()
    };

    return <li>
            <div className="card-panel node-container" style={cardStyle}>

              <span className="left">[{node.inConn}] => </span>
              <span className="left node-name">{node.nodeId}</span>
              <span className="left"> => [{node.outConns.join(",")}]</span>

              <span className="right">
                heartbeat {lastSeenInSecs} seconds ago
              </span>
            </div>
          </li>;
  }

  backgroundColor(){
    // anything staler than 10 seconds should be dark red
    const stalenessBoundary = 10000; 

    const normalizedStaleness = Math.min(
        1,
        (new Date() - this.props.node.lastSeen)/stalenessBoundary );

    const redness = Math.round(256*normalizedStaleness);
    const greenness = Math.round(256*(1 - normalizedStaleness));
    return `rgb(${redness},${greenness},0)`;
  }
}
