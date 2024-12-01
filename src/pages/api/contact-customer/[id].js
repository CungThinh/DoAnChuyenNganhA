import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  // Xử lý khi phương thức là GET (Lấy thông tin ContactCustomer theo ID)
  if (req.method === "GET") {
    try {
      const contactCustomer = await prisma.contactCustomer.findUnique({
        where: {
          id: parseInt(id), // Chuyển đổi id thành số nguyên
        },
        include: {
          bookings: true, // Bao gồm liên kết với Booking
        },
      });

      if (!contactCustomer) {
        return res.status(404).json({
          message: "ContactCustomer not found",
        });
      }

      return res.status(200).json(contactCustomer);
    } catch (error) {
      console.error("Error fetching contactCustomer:", error);

      return res.status(500).json({
        message: "Error fetching contactCustomer",
        error: error.message,
      });
    }
  }

  // Xử lý khi phương thức là DELETE (Xóa ContactCustomer theo ID)
  else if (req.method === "DELETE") {
    try {
      const deletedContactCustomer = await prisma.contactCustomer.delete({
        where: {
          id: parseInt(id), // Chuyển đổi id thành số nguyên
        },
      });

      return res.status(200).json({
        message: "ContactCustomer deleted successfully",
        contactCustomer: deletedContactCustomer,
      });
    } catch (error) {
      console.error("Error deleting contactCustomer:", error);

      return res.status(500).json({
        message: "Error deleting contactCustomer",
        error: error.message,
      });
    }
  }

  // Xử lý khi phương thức là PUT (Cập nhật thông tin ContactCustomer theo ID)
  else if (req.method === "PUT") {
    try {
      const { firstName, lastName, phone, email } = req.body;

      // Cập nhật ContactCustomer dựa trên ID
      const updatedContactCustomer = await prisma.contactCustomer.update({
        where: {
          id: parseInt(id), // Chuyển đổi id thành số nguyên
        },
        data: {
          firstName,
          lastName,
          phone,
          email,
        },
      });

      return res.status(200).json({
        message: "ContactCustomer updated successfully",
        contactCustomer: updatedContactCustomer,
      });
    } catch (error) {
      console.error("Error updating contactCustomer:", error);

      return res.status(500).json({
        message: "Error updating contactCustomer",
        error: error.message,
      });
    }
  }

  // Trả về lỗi nếu không phải là GET, DELETE, hoặc PUT
  else {
    return res.status(405).json({
      message: "Method Not Allowed",
    });
  }
}
