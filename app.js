const unidades = ["kg", "unidad", "cajon", "atado"];

const estadoInicial = {
  productos: [
    { id: 1, nombre: "Manzana roja", categoria: "Fruta", unidad: "kg", precioVenta: 1000, stock: 35, stockMinimo: 8, estado: "fresco" },
    { id: 2, nombre: "Banana", categoria: "Fruta", unidad: "kg", precioVenta: 800, stock: 22, stockMinimo: 6, estado: "maduro" },
    { id: 3, nombre: "Lechuga", categoria: "Verdura", unidad: "kg", precioVenta: 700, stock: 14, stockMinimo: 5, estado: "fresco" },
    { id: 4, nombre: "Tomate", categoria: "Verdura", unidad: "kg", precioVenta: 900, stock: 18, stockMinimo: 7, estado: "fresco" },
    { id: 5, nombre: "Papa", categoria: "Verdura", unidad: "kg", precioVenta: 600, stock: 40, stockMinimo: 10, estado: "fresco" },
    { id: 6, nombre: "Cebolla", categoria: "Verdura", unidad: "kg", precioVenta: 550, stock: 30, stockMinimo: 8, estado: "fresco" },
    { id: 7, nombre: "Zapallo", categoria: "Verdura", unidad: "kg", precioVenta: 650, stock: 20, stockMinimo: 5, estado: "fresco" },
    { id: 8, nombre: "Zanahoria", categoria: "Verdura", unidad: "kg", precioVenta: 620, stock: 28, stockMinimo: 6, estado: "fresco" },
    { id: 9, nombre: "Naranja", categoria: "Fruta", unidad: "kg", precioVenta: 750, stock: 18, stockMinimo: 7, estado: "maduro" },
    { id: 10, nombre: "Piña", categoria: "Fruta", unidad: "unidad", precioVenta: 1200, stock: 14, stockMinimo: 4, estado: "fresco" }
  ],
  ventas: [],
  compras: [],
  siguienteProductoId: 11,
  siguienteVentaId: 1,
  siguienteCompraId: 1
};

function crearSistema(datos = estadoInicial) {
  const estado = JSON.parse(JSON.stringify(datos));

  function buscarProducto(id) {
    return estado.productos.find((producto) => producto.id === Number(id));
  }

  function listarProductos() {
    return estado.productos.map((producto) => ({ ...producto }));
  }

  function crearProducto(datosProducto) {
    const producto = {
      id: estado.siguienteProductoId++,
      nombre: datosProducto.nombre,
      categoria: datosProducto.categoria,
      unidad: datosProducto.unidad || "kg",
      precioVenta: Number(datosProducto.precioVenta),
      stock: Number(datosProducto.stock || 0),
      stockMinimo: Number(datosProducto.stockMinimo || 0),
      estado: datosProducto.estado || "fresco"
    };
    estado.productos.push(producto);
    return { ...producto };
  }

  function editarProducto(id, cambios) {
    const producto = buscarProducto(id);
    if (!producto) throw new Error("Producto no encontrado.");

    Object.assign(producto, {
      nombre: cambios.nombre || producto.nombre,
      categoria: cambios.categoria || producto.categoria,
      unidad: cambios.unidad || producto.unidad,
      precioVenta: cambios.precioVenta === undefined || cambios.precioVenta === "" ? producto.precioVenta : Number(cambios.precioVenta),
      stockMinimo: cambios.stockMinimo === undefined || cambios.stockMinimo === "" ? producto.stockMinimo : Number(cambios.stockMinimo),
      estado: cambios.estado || producto.estado
    });

    return { ...producto };
  }

  function eliminarProducto(id) {
    const indice = estado.productos.findIndex((producto) => producto.id === Number(id));
    if (indice === -1) throw new Error("Producto no encontrado.");
    return estado.productos.splice(indice, 1)[0];
  }

  function registrarVenta(productoId, cantidad) {
    const producto = buscarProducto(productoId);
    const cantidadVendida = Number(cantidad);
    if (!producto) throw new Error("Producto no encontrado.");
    if (producto.estado === "no apto") throw new Error("No se puede vender un producto no apto.");
    if (cantidadVendida <= 0) throw new Error("La cantidad debe ser mayor a cero.");
    if (cantidadVendida > producto.stock) throw new Error("No hay stock suficiente.");

    producto.stock -= cantidadVendida;
    const venta = {
      id: estado.siguienteVentaId++,
      fecha: new Date().toLocaleDateString("es-AR"),
      productoId: producto.id,
      producto: producto.nombre,
      cantidad: cantidadVendida,
      unidad: producto.unidad,
      precioUnitario: producto.precioVenta,
      total: cantidadVendida * producto.precioVenta
    };
    estado.ventas.push(venta);
    return { ...venta };
  }

  function registrarCompra(proveedor, productoId, cantidad, precioCompra) {
    const producto = buscarProducto(productoId);
    const cantidadComprada = Number(cantidad);
    const precio = Number(precioCompra);
    if (!producto) throw new Error("Producto no encontrado.");
    if (cantidadComprada <= 0) throw new Error("La cantidad debe ser mayor a cero.");

    producto.stock += cantidadComprada;
    const compra = {
      id: estado.siguienteCompraId++,
      fecha: new Date().toLocaleDateString("es-AR"),
      proveedor,
      productoId: producto.id,
      producto: producto.nombre,
      cantidad: cantidadComprada,
      unidad: producto.unidad,
      precioUnitario: precio,
      total: cantidadComprada * precio
    };
    estado.compras.push(compra);
    return { ...compra };
  }

  function actualizarEstado(productoId, nuevoEstado) {
    const producto = buscarProducto(productoId);
    if (!producto) throw new Error("Producto no encontrado.");
    producto.estado = nuevoEstado;
    return { ...producto };
  }

  function reporteVentas() {
    const total = estado.ventas.reduce((suma, venta) => suma + venta.total, 0);
    return { total, items: estado.ventas.map((venta) => ({ ...venta })) };
  }

  function reporteCompras() {
    const total = estado.compras.reduce((suma, compra) => suma + compra.total, 0);
    return { total, items: estado.compras.map((compra) => ({ ...compra })) };
  }

  function reporteStock() {
    return estado.productos.map((producto) => ({
      ...producto,
      bajoStock: producto.stock <= producto.stockMinimo
    }));
  }

  return {
    unidades,
    listarProductos,
    crearProducto,
    editarProducto,
    eliminarProducto,
    registrarVenta,
    registrarCompra,
    actualizarEstado,
    reporteVentas,
    reporteCompras,
    reporteStock
  };
}

function formatoMoneda(valor) {
  return Number(valor).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

const coloresConsola = {
  reset: "\x1b[0m",
  verde: "\x1b[32m",
  amarillo: "\x1b[33m",
  azul: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  rojo: "\x1b[31m",
  gris: "\x1b[90m",
  brillante: "\x1b[1m"
};

function color(texto, ...colores) {
  return `${colores.join("")}${texto}${coloresConsola.reset}`;
}

async function iniciarMenuConsola() {
  const readline = require("readline");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const sistema = crearSistema();
  const preguntar = (texto) => new Promise((resolve) => rl.question(texto, resolve));
  const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function escribirAnimado(texto, velocidad = 25, ...colores) {
    for (const caracter of texto) {
      process.stdout.write(colores.length ? color(caracter, ...colores) : caracter);
      await esperar(velocidad);
    }
    process.stdout.write("\n");
  }

  function borrarLinea() {
    process.stdout.write("\r\x1b[2K");
  }

  function centrar(texto, ancho) {
    const espacio = Math.max(0, ancho - texto.length);
    const izquierda = Math.floor(espacio / 2);
    const derecha = espacio - izquierda;
    return `${" ".repeat(izquierda)}${texto}${" ".repeat(derecha)}`;
  }

  async function mostrarMarco(lineas, colorMarco = coloresConsola.verde) {
    const ancho = 54;
    console.log(color(`+${"-".repeat(ancho)}+`, colorMarco));
    for (const linea of lineas) {
      await escribirAnimado(`|${centrar(linea, ancho)}|`, 3, coloresConsola.brillante, colorMarco);
    }
    console.log(color(`+${"-".repeat(ancho)}+`, colorMarco));
  }

  async function mostrarEscaneo(texto) {
    const bloques = ["[=     ]", "[==    ]", "[===   ]", "[ ==== ]", "[  === ]", "[   == ]", "[    =]"];
    for (let i = 0; i < bloques.length; i++) {
      borrarLinea();
      process.stdout.write(`${color(bloques[i], coloresConsola.cyan)} ${texto}`);
      await esperar(70);
    }
    borrarLinea();
  }

  async function mostrarBarrido(texto) {
    const ancho = 42;
    for (let i = 0; i <= ancho; i++) {
      const izquierda = ".".repeat(i);
      const derecha = ".".repeat(ancho - i);
      borrarLinea();
      process.stdout.write(`${color(izquierda, coloresConsola.gris)}${color(">", coloresConsola.cyan)}${color(derecha, coloresConsola.gris)} ${texto}`);
      await esperar(18);
    }
    borrarLinea();
  }

  async function mostrarLineaEstado(texto, detalle) {
    await mostrarEscaneo(texto);
    process.stdout.write(`${color("OK", coloresConsola.verde)} ${texto.padEnd(22)} ${color(detalle, coloresConsola.brillante)}\n`);
  }

  async function mostrarBarraProgreso(texto) {
    const ancho = 28;
    for (let progreso = 0; progreso <= ancho; progreso++) {
      const lleno = "#".repeat(progreso);
      const vacio = "-".repeat(ancho - progreso);
      const porcentaje = String(Math.round((progreso / ancho) * 100)).padStart(3, " ");
      borrarLinea();
      process.stdout.write(`${texto} ${color(`[${lleno}${vacio}]`, coloresConsola.verde)} ${porcentaje}%`);
      await esperar(35);
    }
    process.stdout.write("\n\n");
  }

  async function mostrarPulsoFinal() {
    const texto = "CONSOLA LISTA";
    for (let i = 0; i < 4; i++) {
      borrarLinea();
      process.stdout.write(color(`>> ${texto} <<`, coloresConsola.brillante, coloresConsola.verde));
      await esperar(130);
      borrarLinea();
      process.stdout.write(color(`   ${texto}   `, coloresConsola.gris));
      await esperar(100);
    }
    borrarLinea();
    process.stdout.write(color(`>> ${texto} <<\n\n`, coloresConsola.brillante, coloresConsola.verde));
  }

  async function mostrarTarjetasResumen(productos, stockTotal) {
    const bajoStock = sistema.reporteStock().filter((producto) => producto.bajoStock).length;
    const filas = [
      ["Productos", String(productos.length), "Stock", `${stockTotal} kg`],
      ["Alertas", String(bajoStock), "Moneda", "ARS"]
    ];

    console.log(color("+----------------------+----------------------+", coloresConsola.gris));
    for (const [tituloA, valorA, tituloB, valorB] of filas) {
      const izquierda = `${tituloA}: ${valorA}`.padEnd(20);
      const derecha = `${tituloB}: ${valorB}`.padEnd(20);
      console.log(`${color("|", coloresConsola.gris)} ${color(izquierda, coloresConsola.brillante)} ${color("|", coloresConsola.gris)} ${color(derecha, coloresConsola.brillante)} ${color("|", coloresConsola.gris)}`);
    }
    console.log(color("+----------------------+----------------------+", coloresConsola.gris));
    process.stdout.write("\n");
    await esperar(180);
  }

  async function mostrarBienvenida() {
    const productos = sistema.listarProductos();
    const stockTotal = productos.reduce((suma, producto) => suma + producto.stock, 0);

    try {
      process.stdout.write("\x1b[?25l");
      console.clear();
      await mostrarMarco([
        "SISTEMA DE GESTION DE MERCADO",
        "FRUTAS | VERDURAS | STOCK | REPORTES"
      ]);
      process.stdout.write("\n");
      await mostrarBarrido("leyendo inventario");
      await mostrarTarjetasResumen(productos, stockTotal);
      await mostrarLineaEstado("Cargando productos", "inventario base");
      await mostrarLineaEstado("Activando ventas", "modulo online");
      await mostrarLineaEstado("Activando compras", "proveedores listos");
      await mostrarLineaEstado("Preparando reportes", "tablas y totales");
      await mostrarBarraProgreso("Inicializando");
      await mostrarPulsoFinal();
    } finally {
      process.stdout.write("\x1b[?25h");
    }
  }

  async function mostrarMenu(animado = false) {
    const lineas = [
      "",
      color("Sistema de Gestion de Frutas y Verduras", coloresConsola.brillante, coloresConsola.verde),
      "1. Registrar venta",
      "2. Registrar compra",
      "3. Consultar stock",
      "4. Crear producto",
      "5. Generar reportes",
      "6. Actualizar estado de producto",
      "7. Eliminar producto",
      "0. Salir",
      ""
    ];

    if (!animado) {
      console.log(lineas.join("\n"));
      return;
    }

    for (const linea of lineas) {
      console.log(linea);
      await esperar(35);
    }
  }

  function mostrarProductos() {
    console.table(sistema.reporteStock().map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      stock: `${producto.stock} ${producto.unidad}`,
      precio: formatoMoneda(producto.precioVenta),
      precioPor: "1 kg",
      estado: producto.estado,
      alerta: producto.bajoStock ? "Reponer" : "OK"
    })));
  }

  async function ejecutarOpcion(opcion) {
    try {
      if (opcion === "1") {
        mostrarProductos();
        const id = await preguntar("ID del producto vendido: ");
        const cantidad = await preguntar("Cantidad vendida (kg): ");
        console.log("Venta registrada:", sistema.registrarVenta(id, cantidad));
      } else if (opcion === "2") {
        mostrarProductos();
        const proveedor = await preguntar("Proveedor: ");
        const id = await preguntar("ID del producto comprado: ");
        const cantidad = await preguntar("Cantidad comprada (kg): ");
        const precio = await preguntar("Precio unitario de compra: ");
        console.log("Compra registrada:", sistema.registrarCompra(proveedor, id, cantidad, precio));
      } else if (opcion === "3") {
        mostrarProductos();
      } else if (opcion === "4") {
        const nombre = await preguntar("Nombre: ");
        const categoria = await preguntar("Categoria: ");
        const unidad = await preguntar(`Unidad (${unidades.join(", ")}): `);
        const precioVenta = await preguntar("Precio de venta por 1 kg: ");
        const stock = await preguntar("Stock inicial (kg): ");
        const stockMinimo = await preguntar("Stock minimo (kg): ");
        console.log("Producto creado:", sistema.crearProducto({ nombre, categoria, unidad, precioVenta, stock, stockMinimo }));
      } else if (opcion === "5") {
        console.log("Reporte de ventas");
        console.table(sistema.reporteVentas().items);
        console.log("Total vendido:", formatoMoneda(sistema.reporteVentas().total));
        console.log("Reporte de compras");
        console.table(sistema.reporteCompras().items);
        console.log("Total comprado:", formatoMoneda(sistema.reporteCompras().total));
        console.log("Reporte de stock");
        mostrarProductos();
      } else if (opcion === "6") {
        mostrarProductos();
        const id = await preguntar("ID del producto: ");
        const estado = await preguntar("Estado (fresco, maduro, no apto): ");
        console.log("Estado actualizado:", sistema.actualizarEstado(id, estado));
      } else if (opcion === "7") {
        mostrarProductos();
        const id = await preguntar("ID del producto a eliminar: ");
        console.log("Producto eliminado:", sistema.eliminarProducto(id));
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  await mostrarBienvenida();

  let salir = false;
  let primerMenu = true;
  while (!salir) {
    await mostrarMenu(primerMenu);
    primerMenu = false;
    const opcion = await preguntar("Elegir opcion: ");
    salir = opcion === "0";
    if (!salir) await ejecutarOpcion(opcion);
  }
  rl.close();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { crearSistema, formatoMoneda };
  if (require.main === module) iniciarMenuConsola();
}

if (typeof window !== "undefined") {
  window.crearSistema = crearSistema;
  window.formatoMoneda = formatoMoneda;
}