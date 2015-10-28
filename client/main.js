import React from 'react';
import ReactDOM from 'react-dom';
import Main from './views/mainView.jsx';

import 'whatwg-fetch';

function objValues(obj){
  return Object.keys(obj).map(key => obj[key]);
}

function render(nodes){
  ReactDOM.render(<Main nodes={nodes}/>, document.getElementsByTagName('main')[0]);
}

function nodesFromMeshStatusResponse(meshStatus){
  return objValues(meshStatus.nodes).map( function(node){
    return {
      nodeId: node.nodeId,
      lastSeen: new Date(node.lastSeen)
    };
  });
}

function fetchMeshStatusAndRender(){
  fetch('/mesh-status')
  .then( (response)=> response.json() )
  .then( nodesFromMeshStatusResponse )
  .then( render );
}

setInterval( fetchMeshStatusAndRender, 1000 );
fetchMeshStatusAndRender();
