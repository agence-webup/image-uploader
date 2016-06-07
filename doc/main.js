(function() {
    var uploader = new ImageUploader('[data-js="uploader"]', {
        maxItems: 2,
        ajax: {
            add: function (file, callback, progress) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var picture = {
                        url: event.target.result
                    };

                    progress(50);

                    setTimeout(function() {
                        callback(picture);
                    }, 1000);
                }
                reader.readAsDataURL(file);
            },
            update: function (picture, file, callback, progress) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var picture = {
                        url: event.target.result
                    };

                    progress(50);

                    setTimeout(function() {
                        callback(picture);
                    }, 1000);
                }
                reader.readAsDataURL(file);
            },
            delete: function (picture, callback) {
                callback();
            }
        }
    });
})();
