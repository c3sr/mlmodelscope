import './DrawRectangle.scss';
import {useEffect, useRef, useState} from 'react';

const loadImage = (setImageDimensions, imageUrl) => {
    const img = new Image();
    img.src = imageUrl;
  
    img.onload = () => {
      setImageDimensions({
        height: img.height,
        width: img.width
      });
    };
    img.onerror = (err) => {
      console.log("img error");
      console.error(err);
    };
};

const DrawRectangle = (props) => {
    console.log('props', props)

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);

    const canvasOffSetX = useRef(null);
    const canvasOffSetY = useRef(null);
    const startX = useRef(null);
    const startY = useRef(null);

    const [rectangleWidth, setRectangleWidth] = useState(0);
    const [rectangleHeight, setRectangleHeight] = useState(0);

    // const imageUrl = "https://s3.amazonaws.com/uploads.staging.mlmodelscope.org/plane-blue.jpg";
    const imageUrl = props.url.src;
    const [imageDimensions, setImageDimensions] = useState({});

    useEffect(() => {
        loadImage(setImageDimensions, imageUrl); 
      }, []
    );

    useEffect(() => {
        console.log('set canvas dimensions')
        const canvas = canvasRef.current;
        // canvas.width = 500;
        // canvas.height = 500;
        canvas.width = imageDimensions.width;
        canvas.height = imageDimensions.height;        
        console.log('imageDimensions', imageDimensions)
        console.log('canvas width', canvas.width)
        console.log('canvas height', canvas.height)

        const context = canvas.getContext("2d");
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
        contextRef.current = context;

        const canvasOffSet = canvas.getBoundingClientRect();
        canvasOffSetX.current = canvasOffSet.top;
        canvasOffSetY.current = canvasOffSet.left;
    }, [imageDimensions]);

    const startDrawingRectangle = ({nativeEvent}) => {
        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();

        // startX.current = nativeEvent.clientX - canvasOffSetX.current;
        // startY.current = nativeEvent.clientY - canvasOffSetY.current;
        startX.current = nativeEvent.offsetX;
        startY.current = nativeEvent.offsetY;        

        setIsDrawing(true);
    };

    const drawRectangle = ({nativeEvent}) => {
        if (!isDrawing) {
            return;
        }

        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();

        // const newMouseX = nativeEvent.clientX - canvasOffSetX.current;
        // const newMouseY = nativeEvent.clientY - canvasOffSetY.current;
        const newMouseX = nativeEvent.offsetX;
        const newMouseY = nativeEvent.offsetY;        

        const rectWidth = newMouseX - startX.current;
        const rectHeight = newMouseY - startY.current;
        setRectangleWidth(rectWidth)
        setRectangleHeight(rectHeight)

        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contextRef.current.strokeRect(startX.current, startY.current, rectWidth, rectHeight);
    };

    const stopDrawingRectangle = () => {
        setIsDrawing(false);
        console.log('rectangle dimensions', startX.current, startY.current, rectangleWidth, rectangleHeight)
        
        // Do we need to make a new selectInput just for sampleDraw?
        // Always index 0, and then submit the selected coordinates
        props.selectInput()
    };

    return (
        <div className="parent">
            <img 
                className="image1" 
                src={imageUrl}
                alt="canvas background" 
            />
            <canvas className="canvas-container-rect image2"
                ref={canvasRef}
                onMouseDown={startDrawingRectangle}
                onMouseMove={drawRectangle}
                onMouseUp={stopDrawingRectangle}
                onMouseLeave={stopDrawingRectangle} 
            />

            {/* <div>
                {Object.keys(imageDimensions).length === 0 ? (
                    <b>Calculating...</b>
                ) : (
                    <>
                    <p>
                        <b>Height:</b> {imageDimensions.height}{" "}
                    </p>
                    <p>
                        <b>Width:</b> {imageDimensions.width}{" "}
                    </p>
                    </>
                )}
            </div>             */}
        </div>
    )
}

export default DrawRectangle;

// Note: Based off of this example: 
// https://coolboi567.medium.com/dynamically-get-image-dimensions-from-image-url-in-react-d7e216887b68