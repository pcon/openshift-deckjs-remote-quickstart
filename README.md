This quickstart will get you going with [deck.js](http://imakewebthings.com/deck.js/) and includes the [remote deck.js](https://github.com/chrisjaure/deckjs-remote) functionality

## Running on Openshift

Create an account at [http://openshift.redhat.com](http://openshift.redhat.com)

Create the application (piggybackign on nodejs-0.10)

    rhc app create slides nodejs-0.10 --from-code=git://github.com/pcon/openshift-deckjs-remote-quickstart.git
    
Run `git push` to start the app

## Adding new presentations

Copy the contents of `public/example/` to a new location and edit the `index.html` file.  Then commit and repush to view.

## Remote controlling a presentation

1. Navigate to the presentation and add `?master` to the URL
2. Type in the password of _master_
3. Wait until your guests have loaded the presentation and selected _Join_
4. Give your presentation

## Changing the default password

1. Generate a new md5sum with your new password `echo "mynewpassword" | md5sum `
2. Take the hash and edit `public/extensions/remote/deckjs-remote.js` and change the hash in `key = '...'`