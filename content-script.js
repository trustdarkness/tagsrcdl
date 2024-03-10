// SPDX-FileCopyrightText: © 2024 Mike Thompson mt@trustdarkness.com
// SPDX-License-Identifier: MIT License

// NOTE: ALL CONST VALUES BELOW ARE FOR ILLUSTRATION PURPOSES ONLY
// to preserve my privacy and to not make it too obvious what
// this was designed for, I've inserted dummy values.  This emaple
// should be easy to modify to download most content from the web 
// that's viewable but that the site's authors dont want you to.
// If you like content, especially made by independent creators who
// most of them don't make much and don't have nice things like health
// care, you should buy it.  An ethical discussion of intellectual 
// property and ownership are outside the scope of this comment.
// But there is a technical discussion -- the modern Internet has
// all sorts of tricks for publishers to allow you to see content
// but try to prevent you from doing other things with that content.
// but, if you can see it, if you can hear it, you can save it.
// anything that prevents you from that is usually some kind of 
// hack on top of modern "dynamic" "web apps" and what not -- 
// software designed to abstract much of the complexity of how things
// work away from the user, so the Internet is more like a TV and
// less like a build your own crystal radio like we used to buy
// at radio shack in the 80s.  The point is, the underlying 
// fundamentals haven't changed, if you can figure out how they're
// letting you see / hear / access the content, you can use that 
// to pause and save for later, incorporate into a fair-use 
// composition, analyze it for subliminial messages.  Anything you 
// like.  As it once was, and as it can be again, if you learn and 
// like.

// console.log messages that aren't by their lonesome in a logic
// block are wrapped in if (debug) statements to keep console clean
const debug = true;

// if i ever publish this these should be configurable in 
// the extension settings.  Note id below is a wildcard glob.
// these three consts describe what element should be 
// inspected for a url to try to download
const tag = "video";
const id = "main";
const urlQuerystring = `${tag}[id*=${id}]`

// if you want to try to parse a filename our of the html
// these can be messed with to find the right string
// these 4 consts describe what element the script should 
// try to pull a filename from
const nameContainer = "section";
const nameClass = "download-list";
const nameTag = "h3";
const nameQuerystring = `${nameContainer}[class=${nameClass}] > ${nameTag}`;

// We need an event to hook to inject our navigation code --
// we use a user triggered event to add or change navigation 
// so that it includes our download link or replaces one of their
// links with ours.
//   (for one of the test sites, the actual download link isn't 
//    available until after the user takes a specific action, 
//    which is the action we nooked).
const injectId = "wrapper_outer";
const injectClass = "block";
const injectQuerystring = `#${injectId} .${injectClass}`;

// inject a button into the sites existing navigation --
// the existing navigation element (you could also add a new one,  but
//    this seems more, well, pirate-like, yo ho ho) to transform into our
//    download link.  If you do it right, instead of whatever that link 
//    did before, it now downloads the content you want (but they don't 
//    want you to want).
// note class below is a wildcard glob
const navContainer = "li";
const navClass = "ls";
const navQuerystring = `${navContainer}[class*=${navClass}]`;

// we use a class to make a consistent structure for an error
// message only to enable us to lazy serialize with JSON
// to send via IPC to backend-script
class errorMessage {
    constructor(message) {
        // hardcoded "Error" for a key to search on the other end
        this.error = "Error";
        this.message = message;
    } 
}

// at the moment, this just sends the message to the backend, but
// TODO, display as a user notification.
function userErrorHandler(message) {
    // the object is really a convenience for serializing to JSON for IPC
    msg = new errorMessage(message);
    //  this should be sent as a notification from background-script.js
    browser.runtime.sendMessage(JSON.stringify(msg));
}
  
// there are no doubt a thousand pre-packaged solutions for this, 
// but i wanted to keep things very simple, readable, and transparent
// so we make an object that we can verify and sanitize input during 
// instantiation and also use for  JSON serialization pre-IPC
class toDownload {
  constructor(name, url) {
    this.name = this.slugify(name);
    if (this.isValidHttpUrl(url)) {
      this.url = url;
    } else {
      userErrorHandler("tagsrcdl found "+url+" which is not a valid url");
    }
  }

  // stolen from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
  isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  // adapted from https://stackoverflow.com/questions/8485027/javascript-url-safe-filename-safe-string
  slugify(title) {
    return title
      .trim()
      .replace(/ +/g, '_')
      .replace('__', '_')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
  }
}

// this is our main logic, first we grab our url based on the 
// tags, selectors, and attrs above, then we grab what we think 
// is the name of the thing, then we send all that data, serialized
// to the backend.
function tagDownloader() {
    if (debug) { console.log("tagsrcdl trying to download")};
    // grab the first selection that matches the configured url attrs and get src
    let urlQresponse = document.querySelectorAll(urlQuerystring);
    let source0 = urlQresponse.item(0).src;

    // grab the first selection that matches the configured name attrs and get innerHTML
    let nameQresponse = document.querySelector(nameQuerystring);
    let namesource0 = nameQresponse.innerHTML;

    dl = new toDownload(namesource0, source0);
    let messageToSend = JSON.stringify(dl);
    if (debug) { console.log("sending "+messageToSend) };
    const sending = browser.runtime.sendMessage(messageToSend);
}

// this is where we inject our nagivation into their navigation, 
// maybe making an existing link that used to be called "Offers"
// and was about making money, and we sneaily make that our 
// download link to grab that content they're trying to pretend 
// we can't have.
function injectNav(event) {
  if (debug) { console.log("injecting tagsrcdl into nav") };
  const navreplace = document.querySelector(navQuerystring)
  // clear any existing event handler
  navreplace.onclick = "";
  navreplace.addEventListener("click", tagDownloader);
}

// and on one of the test sites, the user had to click on 
// something before the element we needed the url from would be
// loaded, so that's the element we hooked to do our navigation 
// change.
const injectEl = document.querySelector(injectQuerystring);
if (injectEl === null) {
    // TODO: make this a notification
    console.log("could not find an element to add an event listener that matched "+injectEl);
}
injectEl.addEventListener("click", injectNav);