import { BookModel } from "./model";
import {
  BookCreateInterface,
  BookPatchInterface,
} from "@lib/interfaces/books/bookModel";
import {
  CreateBookSchema,
  PatchBookValidator,
} from "@lib/schema/bookAPISchema";

// Function to handle GET /books
export const getAllBooks = async (request, response) => {
  const searchInput = request.query.searchInput;
  if (!searchInput) {
    const books = await BookModel.find({});
    return response.status(200).json({ books: books });
  } else {
    const books = await BookModel.find({
      $or: [
        { title: { $regex: searchInput, $options: "i" } },
        { author: { $regex: searchInput, $options: "i" } },
        { genre: { $regex: searchInput, $options: "i" } },
      ],
    });
    return response.status(200).json({ books: books });
  }
};

// Function to handle GET /books/view/:id
export const getBookById = async (request, response) => {
  try {
    const book = await BookModel.findById(request.params.id).exec();
    return response.status(200).json(book);
  } catch (err) {
    return response
      .status(400)
      .json({ message: err.message || "BookModel not found" });
  }
};
// Function to handle POST /books/new
export const createNewBook = async (request, response) => {
  let payload: BookCreateInterface = request.body;
  const validate = CreateBookSchema.validate(payload);
  if (validate.error) {
    const error = new Error(
      `Validation Error : ${validate.error.details[0].message}`
    ) as any;
    error.errorCode = "generalError";
    throw error;
  }
  try {
    const newBook = new BookModel(payload);
    await newBook.save();
    return response.status(200).json(payload);
  } catch (err) {
    return response.status(400).json({ message: err.message });
  }
};

// Function to handle PUT /books/edit/:id
export const updateBookById = async (request, response) => {
  let payload: BookPatchInterface = request.body;
  const validate = PatchBookValidator.validate(payload);
  if (validate.error) {
    const error = new Error(
      `Validation Error : ${validate.error.details[0].message}`
    ) as any;
    error.errorCode = "generalError";
    throw error;
  }

  try {
    const updatedBook = await BookModel.findByIdAndUpdate(
      request.params.id,
      payload
    );
    if (updatedBook) {
      await updatedBook.save();
      return response.status(400).json(updatedBook);
    } else {
      return response.status(400).json({ message: "No BookModel Found" });
    }
  } catch (err) {
    return response.status(400).json({ message: err.message });
  }
};

// Function to handle DELETE /books/delete/:id
export const deleteBookById = async (request, response) => {
  try {
    const deleteBook = await BookModel.findByIdAndDelete(request.params.id);
    if (deleteBook === null) {
      return response.status(404).json({ requestmessage: "data not found!" });
    }
    return response.status(204).json();
  } catch (err) {
    console.log(err);
    return response.status(400).json({ requestmessage: err.message });
  }
};
