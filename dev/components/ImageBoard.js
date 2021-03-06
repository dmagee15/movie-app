import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, withRouter, Route, Switch, Link, IndexRoute, Redirect} from 'react-router-dom';
import ReactRedux, {connect, Provider} from 'react-redux';
import Redux, {createStore, bindActionCreators} from 'redux';
import Image from './Image.js';
import AddImage from './AddImage.js';
import BoardInfoMenu from './BoardInfoMenu.js';
import ImageWindow from './ImageWindow.js';
import UserBoardInfoMenu from './UserBoardInfoMenu.js';
import Header from './Header.js';
import Masonry from 'react-masonry-component';

class ImageBoard extends React.Component{
    constructor(props) {
    super(props);
    this.state = {
            addimage: false,
            imagesArray: [],
            searchSubmit: '',
            showImageWindow: null
        }
        fetch('/getimages', {
        method: 'GET',
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        }).then(function(data) {
            return data.json();
        }).then((j) =>{
            var imagesArray = j.slice();
            this.setState({imagesArray});

        });
    }
    closeImageWindow = () => {
        this.setState({showImageWindow: null});
    }
    openImageWindow = (url) => {
        this.setState({showImageWindow: url});
    }
    searchSubmitHandler = (term) => {
        this.setState({searchSubmit: term});
    }
    pinImageHandler = (id) => {
        fetch('/pinimage', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        body: JSON.stringify({"id":id, 'user':''
        })
        }).then(function(data) {
            return data.json();
        }).then((j) =>{
            var imagesArray = j.slice();
            this.setState({imagesArray});

        });
    }
    addImageDataHandler = (url, title) => {
        this.addImageHandler();
        fetch('/addimage', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        body: JSON.stringify({"url":url,
            "title":title
        })
        }).then(function(data) {
            return data.json();
        }).then((j) =>{
            var imagesArray = j.slice();
            this.setState({imagesArray});

        });
    }
    addImageHandler = () => {
        this.setState({addimage: !this.state.addimage});
    }
   render(){
            var searchArray = [];
            var length = this.state.imagesArray.length;
            var regex = new RegExp(this.state.searchSubmit,'i');
            for(var x=0;x<length;x++){
                if(regex.test(this.state.imagesArray[x].username)||regex.test(this.state.imagesArray[x].title)){
                    searchArray.push(this.state.imagesArray[x]);
                }
            }
            var images = searchArray.map((image, index) => 
		   <Image key={index} store={this.props.store} image={image} pinImageHandler={this.pinImageHandler} openImageWindow={this.openImageWindow} changeWindowState={this.props.changeWindowState}/>
		    );
		    var display = 
		        <div>
		            <BoardInfoMenu addImageHandler={this.addImageHandler} store={this.props.store}/>
		            {images}
		        </div>;
            
            var divStyle = {
                width: '100%',
                height: '100vh',
                paddingTop: 60
            }
            return (
                <div>
                <Header store={this.props.store} changeWindowState={this.props.changeWindowState} searchSubmitHandler={this.searchSubmitHandler}/>
               <div style={divStyle}>
                    <Masonry
                className={'my-gallery-class'} // default ''
                elementType={'ul'} // default 'div'
                options={{itemSelector: '.grid-item',
                columnWidth: 290}} // default {}
                disableImagesLoaded={false} // default false
                updateOnEachImageLoad={false} // default false and works only if disableImagesLoaded is false
                >
                    {display}
                </Masonry>
                <AddImage visible={this.state.addimage} addImageHandler={this.addImageHandler} addImageDataHandler={this.addImageDataHandler}/>
                <ImageWindow showImageWindow={this.state.showImageWindow} closeWindow={this.closeImageWindow}/>
               </div>
               </div>
          ); 
					
   }
      
}

export default ImageBoard