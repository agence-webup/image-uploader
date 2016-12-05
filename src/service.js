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

    all() {
        return new Promise((resolve, reject) => {
            resolve(this._pictures);
        });
    }

    add(pictureDto) {
        return new Promise((resolve, reject) => {
            var fileReader = new FileReader();
            fileReader.addEventListener('load', (event) => {
                const picture = {
                    id: this._pictures.length + 1,
                    url: event.target.result
                }

                this._pictures.push(picture);
                resolve(picture);
            });
            fileReader.readAsDataURL(pictureDto.file);
        });
    }

    update(id) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    delete(id, callback) {
        return new Promise((resolve, reject) => {
            this._pictures = this._pictures.filter(function(picture) {
                return picture.id != id;
            });
            resolve();
        });
    }
}
