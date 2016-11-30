"use strict";

class ServiceMock {
    constructor() {
        this._pictures = [{
            id: 1,
            url: "http://lorempixel.com/100/100/",
        }, {
            id: 2,
            url: "http://lorempixel.com/100/100/"
        }];
    }

    all(callback) {
        callback(this._pictures);
    }

    add(pictureDto, callback) {
        var fileReader = new FileReader();
        fileReader.addEventListener('load', (event) => {
            const picture = {
                id: this._pictures.length + 1,
                url: event.target.result
            }

            this._pictures.push(picture);
            callback(picture);
        });
        fileReader.readAsDataURL(pictureDto.file);
    }

    update(id, callback) {
        callback();
    }

    delete(id, callback) {
        this._pictures = this._pictures.filter(function(picture) {
            return picture.id != id;
        });
        callback();
    }
}
