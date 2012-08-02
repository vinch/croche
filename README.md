![croche](https://raw.github.com/vinch/croche/master/croche.png)

**croche** is a very simple remote thumbnail generator with a very simple cache system.

## Prerequisites

We assume you have the following tools already installed:

- Node.js (if not → http://nodejs.org/#download)
- Homebrew (if not → http://mxcl.github.com/homebrew/)

## Installation

First of all, you need to install imagemagick on your server:

  brew install imagemagick

After, that, just clone the project wherever you want:

  git clone git@github.com:vinch/croche.git

Go to the newly created folder and download all the dependencies:

  npm install

After that, you're ready to go! Just start the server:

  node .

## Usage

Go to that URL:

  http://localhost:3333/resize

It accepts the following parameters:

url: URL of the image
width: desired width of the result (optional, default 320)
height: desired height of the result (optional, default 240)

Example:

  http://localhost:3333/resize?url=http://www.vinch.be/attic/me.jpg&width=120&height=95