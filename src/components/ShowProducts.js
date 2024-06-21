import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { show_alert } from './functions';


const ShowProducts = () => {
    const url = 'http://localhost:3001/api/productos';
    const [products, setProducts] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        const res = await axios.get(url);
        setProducts(res.data);
    }

    const openModal = (op,id,name,description,price ) => {
       
        setOperation(op);

        if(op === 1){

            setTitle('registrar nuevo producto');
            setId('');
            setName('');
            setDescription('');
            setPrice('');

        } else if(op === 2){

            setTitle('actualizar producto');
            setId(id);
            setName(name);
            setDescription(description);
            setPrice(price);
           

        }

        window.setTimeout( function ()  {
           document.getElementById('name').focus();
        }, 100);
       
    }

    const validar = () => {

        let parametros;
        let metodo;

        if (name.trim() === '') {
          show_alert('El nombre del producto es obligatorio', 'error', 'name');
                     
        } else if (description.trim() === '') {
          show_alert('La descripción del producto es obligatorio', 'error', 'description');
         
        } else if (isNaN(price)) {
          show_alert('El precio del producto es obligatorio', 'error', 'price');
         
        } else {
            if (operation === 1) {
              parametros= { name: name.trim(), description: description.trim(), price: price} ;
              metodo = 'POST';
            } else  {
                parametros= { id: id, name: name.trim(), description: description.trim(), price: price} ;
                metodo = 'PUT';
            }

            enviarSolicitud(metodo,parametros);

        }  
        
    }

        const enviarSolicitud = async (metodo, parametros) => {
            try {
                let requestUrl = url; // Usar la URL predeterminada inicialmente
                   // Si el método es PUT (actualización) y hay un ID en los parámetros
                if (metodo === 'PUT' && parametros.id) {
                    requestUrl += `/${parametros.id}`; // Agregar el ID al final de la URL
                 
                } else if (metodo === 'DELETE' && parametros.id) {
                    requestUrl += `/${parametros.id}`;
                    
                }
                const response = await axios({
                    method: metodo,
                    url: requestUrl,
                    data: parametros
                });
                
                if (response && response.data) {
                    
                    const { message } = response.data ;

                    console.log("este es el message: "+message);

                    show_alert(message, 'success');

                    document.getElementById('btnCerrar').click();
                    getProducts();
        
                  
                } else {
                    show_alert('Respuesta inesperada del servidor', 'error');
                }
            } catch (error) {
                if (error.response) {
                    const { status, data } = error.response;
                    let errorMessage = `Error ${status}: `;
                    if (data && data.msg) {
                        errorMessage += data.msg;
                    } else {
                        errorMessage += 'Error interno del servidor';
                    }
                    show_alert(errorMessage, 'error');
                } else if (error.request) {
                    show_alert('Error de conexión: no se pudo conectar al servidor', 'error');
                } else {
                    show_alert('Error desconocido: consulte al administrador', 'error');
                }
            }
        }

        const deleteProduct =(id,name) => {
            
            const MySwal = withReactContent(Swal);
            MySwal.fire({
                title: `¿Estas seguro de borrar el producto ${name}?`,
               icon: 'warning', 
               text: 'No podras revertir esta accion',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Si, borrar',
               cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    setId(id);
                    enviarSolicitud('DELETE',{ id: id});
                }
            })
        }
    
  return (

    <div className='App'>
        <div className='container'>
            <div className='row mt-3'>
                <h1 className='text-center'>LISTADO DE PRODUCTOS</h1>

                <hr/>
                <div className='col-md-12 text-end mb-3'>
                    <button  onClick={() => openModal(1)} className='btn btn-primary btn-lg' data-bs-toggle="modal" data-bs-target="#modalProducts" >    
                            <i className="fas fa-plus"></i> Agregar
                    </button>
                </div>

                    
            </div>
            <div className='row'>
                    <div className='table-responsive'>
                        <table className='table table-bordered table-striped table-hover'>
                            <thead className='table-dark'>
                                <tr>
                                    <th>Id</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className='table-group-divider'>
                                
                            {products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{product.description}</td>
                                        <td>{product.price}</td>
                                        <td>
                                            <button onClick={() => openModal(2,product.id,product.name,product.description,product.price)} className='btn btn-info' data-bs-toggle="modal" data-bs-target="#modalProducts">
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button className='btn btn-danger ms-2' onClick={() => deleteProduct(product.id,product.name)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
            </div>
        </div> 
        <div id='modalProducts' className='modal fade' aria-hidden='true' >
            <div className='modal-dialog'>   
                <div className='modal-content'>
                    <div>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{title}</h5>
                            <button className='btn-close' data-bs-dismiss="modal"></button>
                        </div>
                        <div className='modal-body'>
                            <input type="hidden" name="id" value={id} />
                            <div className='input-group mb-3'>
                                <span className='input-group-text'> <i className="fa-solid fa-gift"></i> </span>
                                <input type="text" id='name' className='form-control'  value={name}
                                 onChange={e => setName(e.target.value)} placeholder='Nombre' />
                            </div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'> <i className="fa-solid fa-comment"></i> </span>
                                <input type="text" id='description' className='form-control'  value={description}
                                 onChange={e => setDescription(e.target.value)} placeholder='Descripción' />
                            </div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'> <i className="fa-solid fa-dollar-sign"></i> </span>
                                <input type="number" id='price' className='form-control'  value={price}
                                 onChange={e => setPrice(e.target.value)} placeholder='Precio' />
                            </div>
                            <div className='d-grid col-6 mx-auto'>
                                <button onClick={() => validar()} className='btn btn-primary' >    
                                    <i className="fas fa-plus"></i>Guardar
                                </button>
                            </div>

                            <div className='modal-footer'>
                                <button type='button' id='btnCerrar' className='btn btn-secondary' data-bs-dismiss="modal">Cancelar</button>
                            </div>
                            
                                                        
                        </div>
                    </div>
                </div>
            </div>
        </div> 

    </div>

  )
}

export default ShowProducts