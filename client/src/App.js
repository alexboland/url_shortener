const React = require('react');
const ReactDOM = require('react-dom');
const Validator = require('validator');
import style from './style.css'

class App extends React.Component {

  constructor(props){
    super();
  }

  state = {url: '', topUrls: [], isAbbreviated: false, invalidUrl: false};

  componentDidMount () {
    this.getTopUrls();
  }

  copyToClipboard (event) {
    this.input.select();
    document.execCommand('copy');
    event.target.focus();
  };

  postUrl () {
    if (Validator.isURL(this.state.url)) {
      this.setState({invalidUrl: false});
      fetch('/addNewUrl', {
        credentials: 'same-origin', method: 'post', headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: this.state.url})
      })
        .then(result => result.json())
        .then(result => {
          this.setState({url: `${window.location.href}${result.url}`, isAbbreviated: true});
        });
    } else {
      this.setState({invalidUrl: true});
    }
  }

  getTopUrls () {
    fetch('/listTopUrls', {credentials: 'same-origin', method: 'get', headers: {"Content-Type": "application/json"}})
      .then(results => results.json())
      .then(results => {
        this.setState({topUrls: results.map(url => `${window.location.href}${url.abbreviated_url} (https://www.${url.original_url})`)})
      });
  }

  render () {
    return <div className={style.main}>
      <div className={style.invalid}>{ this.state.invalidUrl && <div className={style.invalidMsg}>Invalid URL!</div>}</div>
      <div className={style.heading}><h1>Sample URL Shortener Project</h1></div>
      <div>
        <h2>Add a URL</h2>
        <input ref={input => this.input = input} className={style.urlBox} type='text' placeholer='Enter your URL here' onChange={event => { this.setState({url: event.target.value, isAbbreviated: false}) } } value={this.state.url}></input>
        { this.state.isAbbreviated ?
          <button className={style.urlButton} onClick={(evt) => {this.copyToClipboard(evt)}}>Copy</button> :
          <button className={style.urlButton} onClick={() => {this.postUrl()}}>Enter</button>
        }
      </div>
      <div className={style.topUrls}>
        <h2>Top 100 URLs:</h2>
        <ul>{this.state.topUrls.map(url => <li>{url}</li>)}</ul>
      </div>
    </div>
  }
}

ReactDOM.render((
  <App />
), document.getElementById('root'));