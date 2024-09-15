import React, { useState, useEffect } from 'react';
import { getMemeByCategory, deleteMeme } from '../services/services';
import MemeGrid from '../components/MemeGrid';
import Modal from '../components/Modal';
import MemeForm from '../components/MemeForm';
import MessageModal from '../components/MessageModal';

const categories = [
  'gatos_siendo_gatos1',
  'gatos_siendo_humanos2',
  'gatos_enfadados3',
  'me_dijiste4',
];

const categoryClasses = {
  gatos_siendo_gatos1: 'bg-gatos-siendo-gatos1',
  gatos_siendo_humanos2: 'bg-gatos-siendo-humanos2',
  gatos_enfadados3: 'bg-gatos-enfadados3',
  me_dijiste4: 'bg-me-dijiste4',
};

const categoryTitles = {
  gatos_siendo_gatos1: 'Gatos Siendo Gatos',
  gatos_siendo_humanos2: 'Gatos Siendo Humanos',
  gatos_enfadados3: 'Gatos Enfadados',
  me_dijiste4: 'Me Dijiste',
};

const Home = () => {
  const [memesByCategory, setMemesByCategory] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [memeToEdit, setMemeToEdit] = useState(null);

  const [message, setMessage] = useState(''); // Estado para el mensaje
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Controla si el mensaje está visible
  const [messageType, setMessageType] = useState('success'); // Controla el tipo de mensaje
  const [isConfirmDialog, setIsConfirmDialog] = useState(false); // Controla si es un cuadro de confirmación
  const [memeToDelete, setMemeToDelete] = useState(null); // Meme que está en proceso de eliminación

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const memesPromises = categories.map((category) =>
          getMemeByCategory(category)
        );
        const memesResults = await Promise.all(memesPromises);
        const memesByCategory = categories.reduce((acc, category, index) => {
          acc[category] = memesResults[index];
          return acc;
        }, {});
        setMemesByCategory(memesByCategory);
      } catch (error) {
        console.error('Error fetching memes:', error);
      }
    };

    fetchMemes();
  }, []);

  const handleDelete = async (category, id) => {
    setIsConfirmDialog(true); // Activamos el cuadro de confirmación
    setIsMessageModalOpen(true); // Abrimos el modal del mensaje
    setMessage('Si confirmas te cargas el meme');
    setMessageType('error');
    setMemeToDelete({ category, id }); // Guardamos la referencia del meme que se va a eliminar
  };

  const confirmDelete = async () => {
    try {
      await deleteMeme(memeToDelete.id);
      setMemesByCategory((prev) => ({
        ...prev,
        [memeToDelete.category]: prev[memeToDelete.category].filter(
          (meme) => meme.id !== memeToDelete.id
        ),
      }));
      setMessage('Meme eliminado con éxito.');
      setMessageType('success');
      setIsConfirmDialog(false); // Quitamos el cuadro de confirmación
    } catch (error) {
      setMessage('Error al cargarte el meme.');
      setMessageType('error');
    }
    setMemeToDelete(null); // Limpiamos el meme a eliminar
  };

  const openModalForCreate = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (meme) => {
    setIsEditMode(true);
    setMemeToEdit(meme);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMemeToEdit(null);
  };

  const refreshMemes = async () => {
    try {
      const memesPromises = categories.map((category) =>
        getMemeByCategory(category)
      );
      const memesResults = await Promise.all(memesPromises);
      const memesByCategory = categories.reduce((acc, category, index) => {
        acc[category] = memesResults[index];
        return acc;
      }, {});
      setMemesByCategory(memesByCategory);
    } catch (error) {
      console.error('Error refreshing memes:', error);
    }
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setIsConfirmDialog(false); // En caso de que sea confirmación, lo desactivamos
  };

  const handleFormSubmit = async (success, actionType) => {
    // success es true si la operación fue exitosa
    // actionType puede ser 'create' o 'edit'
    if (success) {
      setMessage(
        actionType === 'create'
          ? 'Meme creado con éxito.'
          : 'Meme actualizado con éxito.'
      );
      setMessageType('success');
    } else {
      setMessage(
        actionType === 'create'
          ? 'Error al crear el meme.'
          : 'Error al editar el meme.'
      );
      setMessageType('error');
    }
    setIsMessageModalOpen(true); // Mostramos el modal
  };

  return (
    <div className='min-h-screen w-full m-0 bg-gray-100'>
      <h1 className='text-4xl font-bold text-center mb-8'>
        Lista de Memes de Gatos
      </h1>

      <div className='flex justify-center mb-6'>
        <button
          onClick={openModalForCreate}
          className='relative inline-block text-white p-4 rounded-full bg-gradient-to-br from-purple-800 to-purple-900 shadow-lg hover:shadow-2xl transition-transform duration-300 ease-in-out transform hover:scale-105'
        >
          Crear Nuevo Meme
        </button>
      </div>

      {categories.map((category) => (
        <div
          key={category}
          className={`w-full py-10 ${categoryClasses[category]}`}
        >
          <h1 className='text-3xl font-bold mb-8 text-center text-white'>
            {categoryTitles[category]}
          </h1>

          <MemeGrid
            memes={memesByCategory[category] || []}
            onDelete={(id) => handleDelete(category, id)}
            onEdit={(meme) => openModalForEdit(meme)}
          />
        </div>
      ))}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <MemeForm
            onSubmitForm={(success) =>
              handleFormSubmit(success, isEditMode ? 'edit' : 'create')
            }
            initialData={isEditMode ? memeToEdit : null}
            formTitle={isEditMode ? 'Editar Meme' : 'Crear Nuevo Meme'}
            onClose={closeModal}
          />
        </Modal>
      )}

      {isMessageModalOpen && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={closeMessageModal}
          onConfirm={confirmDelete}
          isConfirmDialog={isConfirmDialog}
        />
      )}
    </div>
  );
};

export default Home;
