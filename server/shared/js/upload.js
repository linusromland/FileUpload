//EventListner that prevents default on form and runs function "uploadFile()"
document
	.getElementById("uploadForm")
	.addEventListener("submit", function (event) {
		event.preventDefault();
		uploadFile();
	});

//Functions that send POST to server with file and calulates % and speed of upload
function uploadFile() {
	//The file to be uploaded
    const file = document.getElementById("fileField").files[0];

    //checks if file is to large to upload
	if (file.size > document.getElementById("maxFileSize").attributes[1].value) {
        console.log("you dum dum")
	} else {
		let formData = new FormData();
		let xhr = new XMLHttpRequest();

		let t0 = 0;
		let d0 = 0;

        //adds to file to formData
		formData.append("file", file);

        //runs when return from server
		xhr.onreadystatechange = function () {
			if (this.status == 200) {
				console.log("cool done i thknk");
			}
		};

        //runs during upload and calulates % & speed
		xhr.upload.onprogress = function (e) {
			MBps =
				e.loaded > 0
					? ((e.loaded - d0) * 0.00000095367432) /
					  ((performance.now() - t0) / 1000)
					: 0;
			let timeLeft = ((e.total - e.loaded) * 0.00000095367432) / MBps;
			timeLeftHumanReadble =
				timeLeft > 60
					? (timeLeft / 60).toFixed(1) + "m"
					: timeLeft.toFixed(1) + "s";

			console.log((e.loaded / e.total) * 100);
			var length = (e.loaded / e.total) * 100;
			var whats_left = 100 - length;

			t0 = performance.now();
			d0 = e.loaded;
		};

        //opens and send post request to server
		xhr.open("POST", "/uploadFile");
		xhr.send(formData);
	}
}