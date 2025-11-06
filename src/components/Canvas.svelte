<script>
  import StoryblokClient from "storyblok-js-client";
  import { onMount } from "svelte";
  import { HsvPicker } from "svelte-color-picker";

  const generateRandomColor = () => {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const rgba2hex = (rgb) => {
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  export let width = 600;
  export let height = 600;
  export let color = generateRandomColor();
    console.log(color)
  export let background = "transparent";

  let changeColor = (rgba) => {
    color = rgba2hex(rgba.detail);
  };

  let acceptableTerms = [
    // "The Great Wall of China",
    "frog",
    "dragon",
    "monster",
    "crocodile",
    "scorpion",
  ];

  let canvas;
  let context;
  let isDrawing;
  let start;
  let acceptableDrawing = false;

  let strokes = [];
  let currentStroke = 0;
  let results = [];

  let t, l;

  let dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    let newFile = new File([u8arr], filename, { type: mime });
    return newFile;
  };

  let getPoint = function (event) {
    return [x, y, event.timeStamp - time];
  };

  onMount(() => {
    width = window.innerWidth;
    height = window.innerHeight;
    handleSize();
    setTimeout(() => {
      context = canvas.getContext("2d");
      context.strokeStyle = color;
      context.lineWidth = 3;
      console.log(context)
    }, 100)
  });

  $: if (context && color) {
    // console.log('CHANGING COLOR');
    console.log(color)
    // context.strokeStyle = color;
    // context.fillStyle = '#fff'
  }

  const handleStart = ({ offsetX: x, offsetY: y }) => {
    if (color === background) {
      context.clearRect(0, 0, width, height);
    } else {
      isDrawing = true;
      start = { x, y };
      strokes.push([x, y, new Date()]);
    }
  };

  const clearCanvas = () => {
    context.clearRect(0, 0, width, height);
  }

  const handleEnd = () => {
    console.log("END");
    quickDraw();
    currentStroke++;
    isDrawing = false;
  };

  const handleMove = ({ offsetX: x1, offsetY: y1 }) => {
    if (!isDrawing) return;

    const { x, y } = start;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
    context.fill()
    if(!strokes[currentStroke]) strokes.push([x, y, new Date()]);
    strokes[currentStroke].push([x1, y1, new Date()]);

    start = { x: x1, y: y1 };
  };

  const handleSize = () => {
    const { top, left } = canvas.getBoundingClientRect();
    t = top;
    l = left;
  };

  const getInk = () => {
    let ink = [[], [], []];
    for (let i = 0; i < strokes.length; i++) {
      let stroke = strokes[i];
      for (let j = 0; j < stroke.length; j++) {
        let point = stroke[j];
        ink[0].push(point[0]);
        ink[1].push(point[1]);
        ink[2].push(point[2]);
      }
    }
    return ink;
  };

  const quickDraw = () => {
    const URL =
      "https://inputtools.google.com/request?ime=handwriting&app=quickdraw&dbg=1&cs=1&oe=UTF-8";
    const OPTIONS = document.getElementById("options");
    let headers = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", URL);
    Object.keys(headers).forEach((key, index) => {
      xhr.setRequestHeader(key, headers[key]);
    });

    xhr.onload = function () {
      if (xhr.status === 200) {
        parseResponse(xhr.responseText);
      } else {
        console.log("Request failed, status: " + xhr.status);
      }
    };

    let data = {
      input_type: 0,
      requests: [
        {
          language: "quickdraw",
          writing_guide: { width: width, height: height },
          ink: [getInk()],
        },
      ],
    };

    let request_data = JSON.stringify(data);

    xhr.send(request_data);
    // };

    let parseResponse = function (response) {
      let parsed = JSON.parse(response);
      let list = parsed[1][0][1];
      console.log(list);
      results = list;
      acceptableDrawing = false;
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < acceptableTerms.length; j++) {
          if (list[i] === acceptableTerms[j]) acceptableDrawing = true;
        }
      }
    };
  };

  const Storyblok = new StoryblokClient({
    oauthToken: "C4GK6qBPrnQEOzW6JdDQ9gtt-76603-RETtAmSBRqJ2CH1YfMz_",
  });

  const modifyStory = (picture) => {
    Storyblok.post("spaces/288321122877523/assets/", {
      filename: `croco--${(Math.random() + 1).toString(36).substring(7)}.png`,
      size: "400x600",
      asset_folder_id: 109539565664797,
    })
      .then((response) => {
        const signed = response.data;
        let form = new FormData();
        for (let key in signed.fields) form.append(key, signed.fields[key]);
        form.append("file", dataURLtoFile(picture, "salut.png"));
        return fetch(signed.post_url, {
          method: "POST",
          body: form,
        }).then(() => signed);
      })
      .then((signed) => {
        setTimeout(() => {
          Storyblok.get(
            `spaces/288321122877523/assets/${signed.id}/finish_upload`
          )
            .then(() => {
              Storyblok.get("spaces/288321122877523/assets/", {}).then(
                (response) => {
                  // xList = response.data.assets;
                  console.log(response.data.assets);
                }
              );
            })
            .catch(console.error);
        }, 100);
      })
      .catch(console.error);
  };

</script>

<svelte:window on:resize={handleSize} />

<!-- <p>{results.join(", ")}</p> -->
{#if acceptableDrawing === true}
  NICE CROCODILE!
{/if}

<!-- <p on:click={handleClick}>TEST FILL</p> -->

<HsvPicker on:colorChange={changeColor} startColor={color} />

<canvas
class="absolute left-0 top-0"
  {width}
  {height}
  style:background
  bind:this={canvas}
  on:mousedown={handleStart}
  on:touchstart={(e) => {
    const { clientX, clientY } = e.touches[0];
    handleStart({
      offsetX: clientX - l,
      offsetY: clientY - t,
    });
  }}
  on:mouseup={handleEnd}
  on:touchend={handleEnd}
  on:mouseleave={handleEnd}
  on:mousemove={handleMove}
  on:touchmove={(e) => {
    const { clientX, clientY } = e.touches[0];
    handleMove({
      offsetX: clientX - l,
      offsetY: clientY - t,
    });
  }}
/>

<button class="draw__send" on:click={() => modifyStory(canvas.toDataURL())}>
  I'M DONE
</button>

<button on:click={clearCanvas} class="z-1 absolute">Clear</button>