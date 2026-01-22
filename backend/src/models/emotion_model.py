import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam

def build_emotion_model(input_shape=(48, 48, 1), num_classes=7):
    model = Sequential()

    model.add(Conv2D(32, (3,3), activation='relu', input_shape=input_shape))
    model.add(MaxPooling2D(pool_size=(2,2)))

    model.add(Conv2D(64, (3,3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2,2)))

    model.add(Conv2D(128, (3,3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2,2)))

    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(num_classes, activation='softmax'))

    return model

def main():
    # Data generators for training and validation
    train_data_dir = 'path_to_train_data'  # Ganti dengan path data latih yang sebenarnya
    val_data_dir = 'path_to_val_data'      # Ganti dengan path data validasi yang sebenarnya

    batch_size = 64
    epochs = 30
    input_shape = (48, 48, 1)
    num_classes = 7  # Contoh kelas emosi: marah, jijik, takut, senang, sedih, terkejut, netral

    train_datagen = ImageDataGenerator(rescale=1./255,
                                       rotation_range=10,
                                       zoom_range=0.1,
                                       horizontal_flip=True)

    val_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        train_data_dir,
        target_size=input_shape[:2],
        color_mode='grayscale',
        batch_size=batch_size,
        class_mode='categorical'
    )

    val_generator = val_datagen.flow_from_directory(
        val_data_dir,
        target_size=input_shape[:2],
        color_mode='grayscale',
        batch_size=batch_size,
        class_mode='categorical'
    )

    model = build_emotion_model(input_shape, num_classes)
    model.compile(optimizer=Adam(), loss='categorical_crossentropy', metrics=['accuracy'])

    model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator
    )

    model.save('models/emotion_model.h5')
    print("Model berhasil disimpan di models/emotion_model.h5")

if __name__ == '__main__':
    main()
