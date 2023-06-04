// Global variables
let videoElement;
let canvasElement;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let isDifferent = false;
let model;

// Load the Coco SSD model from TensorFlow Hub
async function loadModel() {
  model = await cocoSsd.load();
}
// Function to perform object detection on a video frame
async function performObjectDetection(frame) {
  await loadModel();
  // Load the Coco SSD model
  const model = await modelPromise;

  // Perform object detection on the frame
  const predictions = await model.detect(frame);

  // Example: Check if a person is detected
  const personDetected = predictions.some((prediction) => prediction.class === 'person');

  // Example: Set the isDifferent flag based on person detection
  isDifferent = personDetected;
}

// Function to start the video recording
function startRecording() {
  recordedChunks = [];
  isRecording = true;

  // Create a new MediaRecorder instance with the appropriate configuration
  mediaRecorder = new MediaRecorder(canvasElement.captureStream(), {
    mimeType: 'video/webm',
  });

  // Add event listeners for data available and stop recording
  mediaRecorder.addEventListener('dataavailable', function(event) {
    recordedChunks.push(event.data);
  });

  mediaRecorder.addEventListener('stop', function() {
    // Convert recorded chunks to a Blob and create a download link for the user
    const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = 'recorded_video.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Start recording
  mediaRecorder.start();
}

// Function to stop the video recording
function stopRecording() {
  isRecording = false;
  mediaRecorder.stop();
}

// Function to handle the webcam stream
function handleWebcamStream(stream) {
  // Create a video element to display the webcam feed

  videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  videoElement.autoplay = true;

  // Create a canvas element to compare frames
  canvasElement = document.createElement('canvas');
  const ctx = canvasElement.getContext('2d');

  // Event listener to handle metadata loaded event
  videoElement.addEventListener('loadedmetadata', function() {
    // Set the canvas dimensions to match the video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Start the video processing loop
    console.log('video loop started');
    processVideoFrames();
  });

  // Append the video element to the document body
  document.body.appendChild(videoElement);
}

// Function to process video frames
function processVideoFrames() {
  // Draw the current frame on the canvas
  canvasElement.getContext('2d').drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  // Perform your TensorFlow.js object detection or image comparison here
  // Convert the canvas image data to a TensorFlow tensor
  const frameTensor = tf.browser.fromPixels(canvasElement);

  // Perform object detection on the frame
  performObjectDetection(frameTensor);

  // Dispose of the frame tensor to release memory
  frameTensor.dispose();
  // You can use TensorFlow.js models for object detection and image manipulation

  // Example: Comparing frames for differences
  if (!isRecording && isDifferent) {
    // Start recording when a difference is detected
    console.log('i am here')
    startRecording();
  } else if (isRecording && !isDifferent) {
    // Stop recording when the differences stop
    console.log('i am here not')
    stopRecording();
  }

  // Schedule the next frame processing
  requestAnimationFrame(processVideoFrames);
}

// Check if the browser supports getUserMedia API
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  // Request permission to access the webcam
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(handleWebcamStream)
    .catch(function(error) {
      console.error('Error accessing the webcam:', error);
    });
} else {
  console.error('getUserMedia is not supported in this browser');
}
