import React from 'react';
import NodeCard from './nodeCard.jsx';

export default class MeshDashboard extends React.Component {
  render(){
    const nodes = this.props.nodes.map( (node)=> <NodeCard key={node.nodeId} node={node}/> );

    return <div className="row">
        <div className="col s12 m3">
            <ul>
              {nodes}
            </ul>
        </div>
    </div>
  }
}

MeshDashboard.defaultProps = {
  nodes: []
};
