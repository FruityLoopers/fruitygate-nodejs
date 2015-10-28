import React from 'react';
import ReactDOM from 'react-dom';
import Main from './views/mainView.jsx';

import 'whatwg-fetch';

function objValues(obj){
  return Object.keys(obj).map(key => obj[key]);
}

function render(meshStatus){
  const nodes = objValues(meshStatus.nodes);
  ReactDOM.render(<Main nodes={nodes}/>, document.getElementsByTagName('main')[0]);
}

function fetchMeshStatusAndRender(){
  fetch('/mesh-status')
  .then( (response)=> response.json() )
  .then( render );
}

setInterval( fetchMeshStatusAndRender, 1000 );
fetchMeshStatusAndRender();
