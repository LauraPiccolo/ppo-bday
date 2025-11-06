<script>
  import { onMount, onDestroy } from 'svelte';

  export let images;
  let container;
  let engine, render, runner, mouseConstraint;
  let Matter;

  let width = 0;
  let height = 0;

  // Function to update canvas size when window resizes
  function updateCanvasSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (render) {
      render.canvas.width = width;
      render.canvas.height = height;
      Matter.Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: width, y: height }
      });
    }
  }

  onMount(async () => {
    Matter = await import('matter-js');
    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Composite,
      Mouse,
      MouseConstraint,
      Common
    } = Matter;

    width = window.innerWidth;
    height = window.innerHeight;

    // Create engine and renderer
    engine = Engine.create();
    const world = engine.world;

    render = Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        background: '#fafafa',
        wireframes: false
      }
    });

    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);

    // --- IMAGE SIZE LOGIC ---
    // Smaller images when more are present
    const baseSize = Math.max(40, 150 - images.length * 10);

    // --- ADD IMAGES AS BODIES ---
    const bodies = images.map((img, i) => {
      const x = Common.random(100, width - 100);
      const y = Common.random(100, height - 200);
      return Bodies.rectangle(x, y, baseSize, baseSize, {
        restitution: 0.9,
        friction: 0.1,
        render: {
          sprite: {
            texture: img,
            xScale: baseSize / 100,
            yScale: baseSize / 100
          }
        }
      });
    });

    Composite.add(world, bodies);

    // --- INVISIBLE WALLS ---
    const wallOptions = { isStatic: true, render: { visible: false } };
    Composite.add(world, [
      Bodies.rectangle(width / 2, -25, width, 50, wallOptions), // top
      Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), // bottom
      Bodies.rectangle(-25, height / 2, 50, height, wallOptions), // left
      Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions) // right
    ]);

    // --- MOUSE CONTROL ---
    const mouse = Mouse.create(render.canvas);
    mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // Fit viewport
    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: width, y: height }
    });

    // --- RESIZE HANDLER ---
    window.addEventListener('resize', updateCanvasSize);
  });

//   onDestroy(() => {
//     if (Matter && render && runner && engine) {
//       Matter.Render.stop(render);
//       Matter.Runner.stop(runner);
//       Matter.Engine.clear(engine);
//       render.canvas.remove();
//       render.textures = {};
//     }
//     window.removeEventListener('resize', updateCanvasSize);
//   });
</script>

<div bind:this={container} class="physics-container"></div>

<style>
  .physics-container {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
    background: #fafafa;
  }
</style>
