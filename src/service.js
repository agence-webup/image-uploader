"use strict";

class AjaxService {
    constructor(url) {
        this.url = url;
    }

    all() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const data = JSON.parse(xhr.response);
                    resolve(data);
                } else if (xhr.readyState == 4) {
                    reject();
                }
            };
            xhr.send();
        });
    }

    add(pictureDto) {
        return new Promise((resolve, reject) => {
            const formdata = new FormData();
            formdata.append('file', pictureDto.file);
            formdata.append('crop', JSON.stringify(pictureDto.crop));

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.url, true);

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const data = JSON.parse(xhr.response);
                    resolve(data);
                } else if (xhr.readyState == 4) {
                    reject();
                }
            };
            xhr.send(formdata);
        });
    }

    update(pictureDto) {
        return new Promise((resolve, reject) => {
            const formdata = new FormData();
            formdata.append('file', pictureDto.file);
            formdata.append('crop', JSON.stringify(pictureDto.crop));

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.url + '/' + pictureDto.id, true);

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const data = JSON.parse(xhr.response);
                    resolve(data);
                } else if (xhr.readyState == 4) {
                    reject();
                }
            };
            xhr.send(formdata);
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('DELETE', this.url + '/' + id, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve();
                } else if (xhr.readyState == 4) {
                    reject();
                }
            };
            xhr.send();
        });
    }

    sort(pictures) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.url + '/sort', true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve();
                } else if (xhr.readyState == 4) {
                    reject();
                }
            };
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(pictures));
        });
    }
}

class MockService {
    constructor() {
        this._pictures = [];
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

    update(pictureDto) {
        return new Promise((resolve, reject) => {
            var fileReader = new FileReader();
            fileReader.addEventListener('load', (event) => {
                for (var i = 0; i < this._pictures.length; i++) {
                    let picture = this._pictures[i];
                    if (picture.id == pictureDto.id) {
                        this._pictures[i].url = event.target.result;
                        resolve(picture);
                        return;
                    }
                }

                reject();
            });
            fileReader.readAsDataURL(pictureDto.file);
        });
    }

    delete(picture) {
        return new Promise((resolve, reject) => {
            this._pictures = this._pictures.filter(function(_picture) {
                return _picture.id != picture.id;
            });
            resolve();
        });
    }

    sort(pictures) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
}
