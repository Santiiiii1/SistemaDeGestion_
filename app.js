const unidades = ["kg", "unidad", "cajon", "atado"];

const estadoInicial = {
  productos: [
    { id: 1, nombre: "Manzana roja", categoria: "Fruta", unidad: "kg", precioVenta: 1000, stock: 35, stockMinimo: 8, estado: "fresco" },
    { id: 2, nombre: "Banana", categoria: "Fruta", unidad: "kg", precioVenta: 800, stock: 22, stockMinimo: 6, estado: "maduro" },
    { id: 3, nombre: "Lechuga", categoria: "Verdura", unidad: "kg", precioVenta: 700, stock: 14, stockMinimo: 5, estado: "fresco" },
    { id: 4, nombre: "Tomate", categoria: "Verdura", unidad: "kg", precioVenta: 900, stock: 18, stockMinimo: 7, estado: "fresco" }
  ],
  ventas: [],
  compras: [],
  siguienteProductoId: 5,
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

async function iniciarMenuConsola() {
  const readline = require("readline");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const sistema = crearSistema();
  const preguntar = (texto) => new Promise((resolve) => rl.question(texto, resolve));

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

  let salir = false;
  while (!salir) {
    console.log(`
Sistema de Gestion de Frutas y Verduras
1. Registrar venta
2. Registrar compra
3. Consultar stock
4. Crear producto
5. Generar reportes
6. Actualizar estado de producto
7. Eliminar producto
0. Salir
`);
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