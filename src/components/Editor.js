import React from 'react';
// import * as PDFJS from 'pdfjs-dist';
import "pdfjs-dist/build/pdf.worker.mjs";
// import myPDF from './sample.pdf';
import { useEffect, useRef } from 'react';

const Editor = () => {

	const canvasRef = useRef(null);
	const pageNumPending = null;

	useEffect(() => {
		(async function () {
			// We import this here so that it's only loaded during client-side rendering.
			const pdfJS = await import('pdfjs-dist/build/pdf');
			pdfJS.GlobalWorkerOptions.workerSrc =
				window.location.origin + '/pdf.worker.min.js';
			const pdf = await pdfJS.getDocument('http://localhost:3000/sample.pdf').promise;

			const page = await pdf.getPage(1);
			let viewport = page.getViewport({ scale: 1.5 });

			// Prepare canvas using PDF page dimensions.
			const canvas = canvasRef.current;
			const canvasContext = canvas.getContext('2d');

			canvas.height = viewport.height;
			canvas.width = viewport.width;

			// Render PDF page into canvas context.
			const renderContext = { canvasContext, viewport };
			const renderTask = page.render(renderContext);

			// Wait for rendering to finish
			renderTask.promise.then(function () {
				// console.log(page.getTextContent());
				// pageRendering = false;
				if (pageNumPending !== null) {
					// New page rendering is pending
					// renderPage(pageNumPending);
					pageNumPending = null;
				}
			}).then(function () {
				// Returns a promise, on resolving it will return text contents of the page
				return page.getTextContent();
			}).then(function (textContent) {

				// Assign CSS to the textLayer element
				var textLayer = document.querySelector(".textLayer");

				textLayer.style.setProperty('--scale-factor', viewport.scale);


				textLayer.style.left = canvas.offsetLeft + 'px';
				textLayer.style.top = canvas.offsetTop + 'px';
				textLayer.style.height = canvas.offsetHeight + 'px';
				textLayer.style.width = canvas.offsetWidth + 'px';

				// Pass the data to the method for rendering of text over the pdf canvas.
				pdfJS.renderTextLayer({
					textContentSource: textContent,
					container: textLayer,
					viewport: viewport,
					textDivs: []
				});
			});




		})();
	}, []);

	return (
		<>
			<canvas ref={canvasRef}/>
			<div id="text-layer" className="textLayer"></div>
		</>


	)
}

export default Editor