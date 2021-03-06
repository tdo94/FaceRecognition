import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import Rank from './components/Rank/Rank.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import './App.css';


const particlesOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable: true
      }
    }
  }
}

const initialState = {
    input:'',
    imageUrl:'',
    box: {},
    route: 'signin',
    isSignIn: false,
    user:{
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculatefacelocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: (1- clarifaiFace.right_col) * width,
      bottomRow: (1 - clarifaiFace.bottom_row) * height
    }
  }

  displayFacebox = (boxin) => {
    this.setState({box: boxin});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('http://localhost:3000/imagelink', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then (response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
          .catch(console.log)

        }
        this.displayFacebox(this.calculatefacelocation(response))
      })
    .catch(err => console.log(err));
}


  onRouteChange = (routein) => {
    if (routein === 'signout'){
      this.setState(initialState)
    } else if (routein === 'home'){
      this.setState( {isSignIn: true})
    }
    this.setState({ route: routein});
  }

  render() {
    const {isSignIn, box, imageUrl, route} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignIn={isSignIn} onRouteChange = {this.onRouteChange} />
        {route === 'home' 
          ? <div> 
              <Logo />
              <Rank 
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm 
                onInputChange = {this.onInputChange} 
                onButtonSubmit = {this.onButtonSubmit}
              />
              <FaceRecognition box = {box} imageUrl = {imageUrl}/>
            </div>
          : (
            route === 'signin' 
            ? <div>
                <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
                <Logo />
              </div>
            : <Register loadUser={this.loadUser} onRouteChange = {this.onRouteChange} />
            )
        }      
      </div>
    );
  }
}

export default App;
