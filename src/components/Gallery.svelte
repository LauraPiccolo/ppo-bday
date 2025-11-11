<script>
  import { onMount, onDestroy } from "svelte";
  import { on } from "svelte/events";

  export let images;
  let container;
  let engine, render, runner, mouseConstraint;
  let Matter;

  let width = 0;
  let height = 0;

  let canvasInitTimeOut;

  // Function to update canvas size when window resizes
  function updateCanvasSize() {
    if(render) {
      if(canvasInitTimeOut) clearTimeout(canvasInitTimeOut)
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    }
    canvasInitTimeOut = setTimeout(() => initCanvas(), 500)
    // width = window.innerWidth;
    // height = window.innerHeight;
    // console.log(width, height)
    // if (render) {
    //   render.canvas.width = width;
    //   render.canvas.height = height;
    //   Matter.Render.lookAt(render, {
    //     min: { x: 0, y: 0 },
    //     max: { x: width, y: height },
    //   });
    // }
  }

  const initCanvas = () => {
    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Composite,
      Mouse,
      MouseConstraint,
      Common,
      Events,
      Query,
    } = Matter;

    width = window.innerWidth;
    height = window.innerHeight;

    // Create engine and renderer
    engine = Engine.create();
    const world = engine.world;
    world.gravity.y = 0.5;

    render = Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
      },
    });

    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);

    // --- IMAGE SIZE LOGIC ---
    // Smaller images when more are present
    // const baseSize = Math.max(40, 150 - images.length * 10);
    // const baseSize = 100;
    let baseSize = (0.1 * window.innerWidth) - images.length / 2;
    baseSize = baseSize < 50 ? 50 : baseSize;

    // --- ADD IMAGES AS BODIES ---
    const bodies = images.map((img, i) => {
      const x = Common.random(100, width - 100);
      // const y = Common.random(100, height - 200);
      // const y = Common.random(0, 10)
      const y = 0;
      let newBody = Bodies.rectangle(x, y, baseSize, baseSize, {
        restitution: 0.9,
        friction: 0.1,
        render: {
          sprite: {
            texture: img,
            strokeStyle: "red",
            xScale: baseSize / 300,
            yScale: baseSize / 300,
            // frictionAir: 0.001
          },
        },
      });
      setTimeout(() => Composite.add(world, newBody), i * 200);
      return newBody;
    });

    // --- INVISIBLE WALLS ---
    const wallOptions = { isStatic: true, render: { visible: false } };
    Composite.add(world, [
      Bodies.rectangle(width / 2, -25, width, 50, wallOptions), // top
      Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), // bottom
      Bodies.rectangle(-25, height / 2, 50, height, wallOptions), // left
      Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions), // right
    ]);

    // --- MOUSE CONTROL ---
    const mouse = Mouse.create(render.canvas);
    mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.9, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);

    render.mouse = mouse;

    // Fit viewport
    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    });

    if ( typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
      console.log('device orientation exists')
      gyroscopePossible = true
      window.addEventListener("deviceorientation", (event) => {
        // event.beta  = front/back tilt (-180 to 180)
        // event.gamma = left/right tilt (-90 to 90)

        const beta = event.beta || 0; // front/back
        const gamma = event.gamma || 0; // left/right

        // Normalize and apply as gravity
        // Divide to make it gentle — adjust scaling as you like
        engine.world.gravity.x = Matter.Common.clamp(gamma / 50, -1, 1);
        engine.world.gravity.y = Matter.Common.clamp(beta / 50, -1, 1);
      });
    }

  }
 
  onMount(async () => {
    Matter = await import("matter-js");
    initCanvas()
    // --- RESIZE HANDLER ---
    window.addEventListener("resize", updateCanvasSize);
  });

  let gyroscopePermission = false;
  let gyroscopePossible = false;

  const allowGyroscope = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        // gyroscopePossible = true;
        // alert('Asking for permssion')
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === "granted") {
          gyroscopePermission = true;
          window.addEventListener("deviceorientation", handleOrientation);
        }
      }
  }
</script>

<div bind:this={container} class="physics-container"></div>

<a
  href="/"
  class="rounded-[5px] py-[20px] px-[40px] flex flex-row items-center justify-center shrink-0 absolute right-[20px] bottom-[20px] draw-link"
>
  <button class="text-left font-all-font-family text-all-font-size relative">
    DRAW YOUR CROCODILE →
  </button>
</a>

{#if gyroscopePossible && gyroscopePermission === false}
<button
  class="rounded-[5px] py-[20px] px-[40px] flex flex-row items-center justify-center shrink-0 absolute right-[20px] bottom-[20px] draw-link" on:click={allowGyroscope}
>
  <p class="text-left font-all-font-family text-all-font-size relative">
    ALLOW GYROSCOPE FOR MORE FUN →
  </p>
</button>
{/if}

<style>
  .physics-container {
    position: fixed;
    inset: 0;
    overflow: hidden;
        width: 100vw;
    height: 100vh;
  }

  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
    background-color: transparent;
    /* background: #fafafa; */
  }

  .draw-link {
    backdrop-filter: blur(4px);
    background-color: #ffffff80;
    border: solid 1px white;
    /* color: #a0a5a2; */
    color: black;
    transition-duration: 0.3s;
    cursor: pointer;
  }

  .draw-link:hover {
    background-color: #ffffff;
    color: black;
  }
</style>
