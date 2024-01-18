import React, { useState } from 'react';
// import * as PDFJS from 'pdfjs-dist';
import "pdfjs-dist/build/pdf.worker.mjs";
// import myPDF from './sample.pdf';
import { useEffect} from 'react';

const Editor = () => {
	const [link, Setlink] = useState('http://localhost:3000/abc.pdf')

	useEffect(() => {
		(async function () {
			// We import this here so that it's only loaded during client-side rendering.
			const pdfJS = await import('pdfjs-dist/build/pdf');
			pdfJS.GlobalWorkerOptions.workerSrc =
				window.location.origin + '/pdf.worker.min.js';
			const pdf = await pdfJS.getDocument(link).promise;

			const container = document.getElementById('container');

			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				let viewport = page.getViewport({ scale: 1.0 });

				let div = document.createElement("div");

				// Set id attribute with page-#{pdf_page_number} format
				div.setAttribute("id", "page-" + i);

				// This will keep positions of child elements as per our needs
				div.setAttribute("style", "position: relative");
				// div.setAttribute("style", "text-align: center");

				div.style.width = Math.floor(viewport.width) + "px";
				// div.style.height = Math.floor(viewport.height) + "px";


				// Append div within div#container
				container.appendChild(div);

				var canvas = document.createElement("canvas");

				// Append Canvas within div#page-#{pdf_page_number}
				div.appendChild(canvas);

				// Prepare canvas using PDF page dimensions.
				const canvasContext = canvas.getContext('2d');

				var outputScale = window.devicePixelRatio || 1;

				canvas.width = Math.floor(viewport.width * outputScale);
				canvas.height = Math.floor(viewport.height * outputScale);
				canvas.style.width = Math.floor(viewport.width) + "px";
				canvas.style.height = Math.floor(viewport.height) + "px";

				var transform = outputScale !== 1
					? [outputScale, 0, 0, outputScale, 0, 0]
					: null;

				// Render PDF page into canvas context.
				const renderContext = {
					canvasContext: canvasContext,
					transform: transform,
					viewport: viewport,
				};

				const renderTask = page.render(renderContext);

				// Wait for rendering to finish
				renderTask.promise.then(function () {
					// Returns a promise, on resolving it will return text contents of the page
					return page.getTextContent();
				}).then(function (textContent) {

					// Assign CSS to the textLayer element
					let textLayerDiv = document.createElement("div");

					// Set it's class to textLayer which have required CSS styles
					textLayerDiv.setAttribute("class", "textLayer");


					// Append newly created div in `div#page-#{pdf_page_number}`
					div.appendChild(textLayerDiv);


					textLayerDiv.style.setProperty('--scale-factor', viewport.scale);


					textLayerDiv.style.left = canvas.offsetLeft + 'px';
					textLayerDiv.style.top = canvas.offsetTop + 'px';
					textLayerDiv.style.height = canvas.offsetHeight + 'px';
					textLayerDiv.style.width = canvas.offsetWidth + 'px';

					// Pass the data to the method for rendering of text over the pdf canvas.
					pdfJS.renderTextLayer({
						textContentSource: textContent,
						container: textLayerDiv,
						viewport: viewport,
						textDivs: []
					});
				});
			}






		})();
	}, [link]);

	return (
		<div id='container'></div>

	)
}

export default Editor