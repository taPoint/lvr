// Галерея - фильтрация и модальное окно
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.gallery__filter');
    const galleryItems = document.querySelectorAll('.gallery__item');
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
        <div class="gallery-modal__overlay">
            <div class="gallery-modal__content">
                <button class="gallery-modal__close" aria-label="Закрыть">
                    <i data-lucide="x"></i>
                </button>
                <img class="gallery-modal__image" src="" alt="">
                <div class="gallery-modal__caption"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Инициализируем иконки в модальном окне
    lucide.createIcons();
    
    const modalImage = modal.querySelector('.gallery-modal__image');
    const modalCaption = modal.querySelector('.gallery-modal__caption');
    const closeButton = modal.querySelector('.gallery-modal__close');
    
    // Функция фильтрации
    function filterGallery(category) {
        galleryItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
                // Плавное появление
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // Обработчики для кнопок фильтра
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем активный класс со всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('gallery__filter--active'));
            // Добавляем активный класс к нажатой кнопке
            button.classList.add('gallery__filter--active');
            
            // Получаем категорию из data-filter
            const category = button.getAttribute('data-filter');
            filterGallery(category);
        });
    });
    
    // Обработчики для открытия модального окна
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('.gallery__image');
            const caption = item.querySelector('.gallery__caption');
            
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalCaption.textContent = caption ? caption.textContent : '';
            
            // Показываем модальное окно с анимацией
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('gallery-modal--active');
            }, 10);
            
            // Блокируем скролл страницы
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Функция закрытия модального окна
    function closeModal() {
        modal.classList.remove('gallery-modal--active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Обработчики для закрытия модального окна
    closeButton.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('gallery-modal__overlay')) {
            closeModal();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('gallery-modal--active')) {
            closeModal();
        }
    });
    
    // Инициализация - показываем все элементы
    filterGallery('all');
});
