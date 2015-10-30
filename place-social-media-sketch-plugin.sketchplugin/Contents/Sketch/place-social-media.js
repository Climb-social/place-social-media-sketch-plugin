"use strict";

var onRun = function onRun(context) {

    var doc = context.document;
    var selection = context.selection;

    var itemsCollection = [];
    var imageUrls = [];

    var alert = function alert(msg) {
        var title = arguments.length <= 1 || arguments[1] === undefined ? "Error" : arguments[1];

        var app = NSApplication.sharedApplication();
        app.displayDialog(msg);
    };

    var request = function request(url) {
        var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
        return NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);
    };

    var getCollectionIdFromUser = function getCollectionIdFromUser() {
        var reason = arguments.length <= 0 || arguments[0] === undefined ? "Enter the Climb ID to retrieve:" : arguments[0];

        var collectionId = [doc askForUserInput:"What is the Climb.social Collection ID?" initialValue:""];

        if (collectionId == '') {
            // if user entered nothing
            reason = "Please specify a Climb.social ID";
            getCollectionIdFromUser(reason);
        } else if (collectionId == null) {
            // if user cancelled box
            log("null's here!");
        } else {
            collectionId = encodeURIComponent(collectionId);
            fetchCollection(collectionId); // everything is ok
        }
    };

    var fetchCollection = function fetchCollection(query) {
        var url = 'http://app.climb.social/api/v1/collections/' + query;
        var items = JSON.parse(NSString.alloc().initWithData_encoding(request(url), NSUTF8StringEncoding));

        if (typeof items == 'undefined') {
            alert('This Climb ID is not recognised.', 'Nothing found');
        }

        items.map(function (item) {
            var image = item.image;

            if (image) {
                imageUrls.push(image.url);
            }
        });

        insertToSketch();
    };

    var loadMedia = function loadMedia(numOfLayers) {
        var numberOfItems = imageUrls.length;

        for (var i = 0; i < numOfLayers; i++) {
            var randomIndex = Math.floor(Math.random() * numberOfItems);
            var imageUrl = imageUrls[randomIndex];
            var newImage = NSImage.alloc().initWithContentsOfURL(NSURL.URLWithString(imageUrl));
            itemsCollection.push(newImage);
        }

        return itemsCollection;
    };

    function insertToSketch() {
        var allLayers = doc.currentPage().layers();
        var itemsCollection = loadMedia(selection.count());

        for (var i = 0; i < selection.count(); i++) {

            var layer = selection[i];

            if (layer.class() == MSShapeGroup) {

                var image = itemsCollection[i];
                var fill = layer.style().fills().firstObject();
                fill.setFillType(4);

                var coll = layer.style().fills().firstObject().documentData().images();
                [fill setPatternImage:image collection:coll]
                layer.style().fills().firstObject().setPatternFillType(1);
            }
        }
    }

    function activate() {
        if (selection.count() == 0) {
            alert('Select at least one shape.', 'Oh, dude…');
        } else {
            getCollectionIdFromUser();
        }
    }

    activate();
};
