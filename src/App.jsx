import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Toast,
  ToastContainer,
} from "react-bootstrap";

export default function App() {
  // Ambil data dari localStorage (kalau ada)
  const initialProducts = useMemo(() => {
    const saved = localStorage.getItem("products");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Makanan", description: "Produk makanan siap saji", price: 15000, category: "Makanan", releaseDate: "2024-01-01", stock: 10, active: true },
          { id: 2, name: "Minuman", description: "Aneka minuman dingin & hangat", price: 8000, category: "Minuman", releaseDate: "2024-02-10", stock: 20, active: true },
        ];
  }, []);

  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [stock, setStock] = useState(0);
  const [active, setActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Simpan otomatis ke localStorage setiap kali products berubah
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // 🔍 Validasi input
  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) newErrors.name = "Nama Produk wajib diisi.";
    else if (trimmedName.length < 3)
      newErrors.name = "Minimal 3 karakter.";
    else if (trimmedName.length > 100)
      newErrors.name = "Maksimal 100 karakter.";

    if (description.trim().length < 20)
      newErrors.description = "Deskripsi minimal 20 karakter.";

    if (!price || price <= 0)
      newErrors.price = "Harga harus lebih dari 0.";

    if (!category)
      newErrors.category = "Kategori wajib dipilih.";

    if (!releaseDate)
      newErrors.releaseDate = "Tanggal rilis wajib diisi.";
    else {
      const today = new Date().toISOString().split("T")[0];
      if (releaseDate > today)
        newErrors.releaseDate = "Tanggal tidak boleh di masa depan.";
    }

    if (stock < 0)
      newErrors.stock = "Stok tidak boleh negatif.";

    return newErrors;
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setReleaseDate("");
    setStock(0);
    setActive(false);
    setErrors({});
    setEditingId(null);
  };

  const showToastMsg = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      showToastMsg("Periksa kembali input Anda.", "danger");
      return;
    }

    const newProduct = {
      id: editingId ?? Date.now(),
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      releaseDate,
      stock: Number(stock),
      active,
    };

    if (editingId === null) {
      setProducts((prev) => [newProduct, ...prev]);
      showToastMsg("Produk berhasil ditambahkan.", "success");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? newProduct : p))
      );
      showToastMsg("Produk berhasil diperbarui.", "success");
    }
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setReleaseDate(product.releaseDate);
    setStock(product.stock);
    setActive(product.active);
  };

  const handleDelete = (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const ok = window.confirm(`Hapus Produk "${target.name}"?`);
    if (!ok) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToastMsg("Produk berhasil dihapus.", "success");
    resetForm();
  };

  const isEditing = editingId !== null;

  return (
    <Container className="py-4">
      <Row>
        {/* Form Produk */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">
              {isEditing ? "Edit Produk" : "Tambah Produk"}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Sembako"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    isInvalid={!!errors.name}
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tuliskan deskripsi produk minimal 20 karakter"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Harga (Rp)</Form.Label>
                  <Form.Control
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    isInvalid={!!errors.price}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.price}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    isInvalid={!!errors.category}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Pakaian">Pakaian</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Rilis</Form.Label>
                  <Form.Control
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    isInvalid={!!errors.releaseDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.releaseDate}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Stok Tersedia: {stock}</Form.Label>
                  <Form.Range
                    min={0}
                    max={100}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                  {errors.stock && (
                    <div className="text-danger small">{errors.stock}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="activeSwitch"
                    label="Produk Aktif"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant={isEditing ? "primary" : "success"}
                  >
                    {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Daftar Produk */}
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Tanggal Rilis</th>
                    <th>Stok</th>
                    <th>Aktif</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">
                        Belum ada data produk.
                      </td>
                    </tr>
                  ) : (
                    products.map((p, i) => (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td>{p.name}</td>
                        <td>Rp {p.price.toLocaleString()}</td>
                        <td>{p.category}</td>
                        <td>{p.releaseDate}</td>
                        <td>{p.stock}</td>
                        <td>{p.active ? "✅" : "❌"}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleEdit(p)}
                          >
                            Edit
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body
            className={toastVariant === "danger" ? "text-white" : ""}
          >
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
