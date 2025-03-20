const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  // properti yang di olah di sisi client
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  // apabila tidak melampirkan properti name
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // apabila melampirkan properti readPage lebih besar dari properti pageCount
  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  // properti yang diolah di sisi server
  const id = nanoid(16);
  const finished = (pageCount === readPage);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // menggabungkan semua properti
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  // memasukan semua properti kedalam array books
  books.push(newBook);

  // pengecekan newBooks sudah tersimpan dalam array books
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // jika sukses dan newBooks tersimpan dalam array books
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  // jika gagal dan newBooks tidak tersimpan dalam array books
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  // menyaring daftar buku berdasarkan properti yang diterima dalam query string
  const { name, reading, finished } = request.query;

  let filteredBooks = books;

  // mengecek paroperti nama
  if (name !== undefined) {
    filteredBooks = filteredBooks.filter((book) => book
      .name.toLowerCase().includes(name.toLowerCase()));
  }

  // mengecek properti reading
  if (reading !== undefined) {
    filteredBooks = filteredBooks.filter((book) => book.reading === (reading === 'true'));
  }

  // mengecek properti finished
  if (finished !== undefined) {
    filteredBooks = filteredBooks.filter((book) => book.finished === Boolean(Number(finished)));
  }

  // menampilkan semua buku dalam array Books
  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);

  return response;
};

const getBookByIdHandler = (request, h) => {
  // menyaring daftar buku berdasarkan properti id dalam query string
  const { bookId } = request.params;
  const book = books.filter((b) => b.id === bookId)[0];

  // pengecekan buku dengan Id yang diminta client
  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  // apabila buku dengan Id yang diminta client tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);

  return response;
};

const editBookByIdHandler = (request, h) => {
  // menyaring daftar buku berdasarkan properti id dalam query string
  const { bookId } = request.params;
  // properti yang dapat di edit oleh client
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  // mencari indeks dengan Id yang sesuai
  const index = books.findIndex((book) => book.id === bookId);

  // pengecekan apabila indeks buku yang dicari ditemukan
  if (index !== -1) {
    // gagal apabila tidak menemukan properti nama buku
    if (name === undefined) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      });
      response.code(400);

      return response;
    }

    // gagal apabila properti readPage lebih besar dari pageCount
    if (pageCount < readPage) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      });
      response.code(400);

      return response;
    }

    // Apabila pageCount sama dengan readPage, maka finished akan memiliki nilai true
    const finished = (pageCount === readPage);

    // memperbarui Book
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    // berhasil
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);

    return response;
  }

  // gagal apabila Id tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);

  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);

    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);

  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
