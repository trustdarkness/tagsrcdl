// SPDX-FileCopyrightText: © 2024 Mike Thompson mt@trustdarkness.com
// SPDX-License-Identifier: MIT License

// NOTE: ALL FILE SCOPED VALUES BELOW ARE FOR ILLUSTRATION PURPOSES ONLY
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

// this must be a subdirectory inside your downloads folder as 
// specified in Settings: General: Downloads: Save Files To
// Note: these cannot be absolute or relative paths.
let download_subdir = "special-downloads"

// a filter here is a string that if it appears within the 
// text the script found to use for the name of the 
// downloaded file, that file will be saved to a different
// default subdir of your general downloads folder
// Note: these cannot be absolute or relative paths.
const filter0 = "redheads"
const filter0_subdir = "do-it-better"

// this hooks a function call onto an event, in this case, 
// when the content-script.js tries to send a mesasge to
// background-script.js, it will pass what it gets
// to messageHandler below.
browser.runtime.onMessage.addListener(messageHandler);

// messageHandler handles all messages sent to background, 
// generically, but we only have one right now (passing
// our data back. All the faculties to handle other message 
// types are available though not in use
function messageHandler(message, sender, sendResponse) {
  if (debug) { console.log("background script received message: "+message) };
  // toDownload object serialized as JSON for IPC.
  data = JSON.parse(message);
  // since we only have one message type, we assume
  // consistent deserialization, but this should be wrapped
  // in a try/except block to notify the user.
  // input parsing and sanitization are handled during
  // object instantiation.
  filename = data.name;
  url = data.url;
  downloadTag(filename, url);
}

// we don't use the toolbar icon anymore
// function updateIcon() {
//   browser.browserAction.setIcon({
//     icon: downloaded ? {
//       19: "icons/tagsrcdl_sm_dn_19.png",
//       38: "icons/tagsrcdl_sm_dn_38.png"
//     } : {
//       19: "icons/tagsrcdl_sm_19.png",
//       38: "icons/tagsrcdl_sm_38.png"
//     },
//   });
//   browser.browserAction.setTitle({
//     // Screen readers can see the title
//     title: downloaded ? 'Downloaded' : 'Download it!',
//   }); 
// }

function downloadTag(dlname, dlurl) {
  if (debug) { console.log("trying to download "+dlname+" at url: "+dlurl) };
  // being very explicit about each of these steps
  // for readability and because javascript can be finicky
  let urlcomponents = dlurl.split("?");
  let strippedurl = urlcomponents[0];
  var lastchar = strippedurl.length;
  var lminus3 = lastchar-3;
  let fileextension = urlcomponents[0].substring(lminus3, lastchar);
  let filename = `${dlname}.${fileextension}`
  if (filename.includes(filter0)) {
    download_subdir = filter0_subdir;
  }
  let filepath = `${download_subdir}/${filename}`;
  console.log("going to write to "+filepath);
  let downloading = browser.downloads.download({
      url: dlurl,
      filename: filepath,
      conflictAction: "overwrite"
  });
  document.tagDownloaded = true;
}
