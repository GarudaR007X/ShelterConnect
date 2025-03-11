import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CssBaseline,
  Chip,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PersonIcon from "@mui/icons-material/Person";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TenantForm from "../components/TenantForm.jsx";
import jsPDF from "jspdf";
// Import API functions
import { getAllTenants, deleteTenantById } from "../api/tenantApi.js";
import { getCurrentUser } from "../api/userApi.js";

const drawerWidth = 240;

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

const handleDownloadReport = (tenant) => {
  // Create a new PDF document with default font
  const doc = new jsPDF();

  // Add default font
  doc.setFont("helvetica");

  let yPosition = 10;
  const leftMargin = 10;
  const pageWidth = doc.internal.pageSize.width;
  const textWidth = pageWidth - leftMargin * 2;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Tenant Report: ${tenant.personalDetails.firstName} ${tenant.personalDetails.lastName}`,
    leftMargin,
    yPosition
  );
  yPosition += 10;

  // Personal Details Section
  doc.setFontSize(14);
  doc.text("Personal Details", leftMargin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  // Format and add content
  const details = [
    `Full Name: ${tenant.personalDetails.title || ""} ${
      tenant.personalDetails.firstName
    } ${tenant.personalDetails.middleName || ""} ${
      tenant.personalDetails.lastName
    }`,
    `Date of Birth: ${formatDate(tenant.personalDetails.dateOfBirth)}`,
    `Place of Birth: ${tenant.personalDetails.placeOfBirth || "N/A"}`,
    `Gender: ${tenant.personalDetails.gender || "N/A"}`,
    `Marital Status: ${tenant.personalDetails.maritalStatus || "N/A"}`,
    `National Insurance Number: ${
      tenant.personalDetails.nationalInsuranceNumber || "N/A"
    }`,
    `Contact Number: ${tenant.personalDetails.contactNumber || "N/A"}`,
    `Email: ${tenant.personalDetails.email || "N/A"}`,
  ];

  details.forEach((detail) => {
    doc.text(detail, leftMargin, yPosition);
    yPosition += 5;
  });

  // Property Details Section
  yPosition += 5;
  doc.setFontSize(14);
  doc.text("Property Details", leftMargin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  const propertyDetails = [
    `Room Number: ${tenant.roomNumber || "N/A"}`,
    `Sign In Date: ${formatDate(tenant.signInDate)}`,
    `Sign Out Date: ${
      tenant.signOutDate ? formatDate(tenant.signOutDate) : "N/A"
    }`,
  ];

  propertyDetails.forEach((detail) => {
    doc.text(detail, leftMargin, yPosition);
    yPosition += 5;
  });

  // Financial Information Section
  yPosition += 5;
  doc.setFontSize(14);
  doc.text("Financial Information", leftMargin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  const financialDetails = [
    `Source of Income: ${tenant.sourceOfIncome || "N/A"}`,
    `Benefits: ${tenant.benefits || "N/A"}`,
    `Total Amount: ${tenant.totalAmount || "N/A"}`,
    `Payment Frequency: ${tenant.paymentFrequency || "N/A"}`,
  ];

  financialDetails.forEach((detail) => {
    doc.text(detail, leftMargin, yPosition);
    yPosition += 5;
  });

  // Health Information Section
  yPosition += 5;
  doc.setFontSize(14);
  doc.text("Health Information", leftMargin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  const healthDetails = [
    `Physical Health Conditions: ${
      tenant.physicalHealthConditions ? "Yes" : "No"
    }`,
    `Mental Health Conditions: ${tenant.mentalHealthConditions ? "Yes" : "No"}`,
    `Prescribed Medication: ${tenant.prescribedMedication ? "Yes" : "No"}`,
    `Self-Harm or Suicidal Thoughts: ${
      tenant.selfHarmOrSuicidalThoughts ? "Yes" : "No"
    }`,
  ];

  healthDetails.forEach((detail) => {
    doc.text(detail, leftMargin, yPosition);
    yPosition += 5;
  });

  // Skip signature section for now since it's causing issues
  yPosition += 5;
  doc.setFontSize(14);
  doc.text("Signatures", leftMargin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.text("Tenant Signature: See original document", leftMargin, yPosition);
  yPosition += 5;
  doc.text(
    "Support Worker Signature: See original document",
    leftMargin,
    yPosition
  );

  // Save the PDF - use a try/catch to handle any errors
  try {
    doc.save(
      `Tenant_Report_${tenant.personalDetails.firstName}_${tenant.personalDetails.lastName}.pdf`
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF report. Please try again.");
  }
};
const Tenants = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [tenantsData, setTenantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openTenantForm, setOpenTenantForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Table control states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  useEffect(() => {
    fetchTenantsData();
  }, []);

  useEffect(() => {
    getCurrentUser(navigate, setUserName);
  }, []);

  const fetchTenantsData = async () => {
    setLoading(true);
    try {
      const result = await getAllTenants();
      if (result.success && Array.isArray(result.data)) {
        setTenantsData(result.data);
      } else {
        setTenantsData([]);
        setError("Invalid data structure received");
      }
    } catch (error) {
      console.error("Error fetching tenants data:", error);
      setError("Failed to fetch tenants data");
      setTenantsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

const filteredData = tenantsData.filter((row) => {
  // Helper function to check if a value matches the searchTerm
  const checkMatch = (value) => {
    if (value == null) return false;
    if (typeof value === "object") {
      // Recursively search within the nested object
      return Object.values(value).some((nestedValue) =>
        checkMatch(nestedValue)
      );
    }
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  };

  return Object.values(row).some((value) => checkMatch(value));
});


  const sortedData = sortData(filteredData);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout. Please try again.");
    }
  };

  const handleEditClick = (tenant) => {
    setSelectedTenant(tenant);
    setEditMode(true);
    setOpenTenantForm(true);
  };

  const handleDeleteClick = (tenant) => {
    setSelectedTenant(tenant);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteTenantById(selectedTenant._id);
      if (result.success) {
        toast.success("Tenant deleted successfully!");
        fetchTenantsData();
      } else {
        toast.error(result.message || "Failed to delete tenant");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
    setOpenDeleteDialog(false);
    setSelectedTenant(null);
  };

  const handleOpenTenantForm = () => {
    setEditMode(false);
    setSelectedTenant(null);
    setOpenTenantForm(true);
  };

  const handleCloseTenantForm = () => {
    setOpenTenantForm(false);
    setEditMode(false);
    setSelectedTenant(null);
  };

  const handleFormSuccess = () => {
    fetchTenantsData();
    setOpenTenantForm(false);
    setEditMode(false);
    setSelectedTenant(null);
  };

  // Helper function to safely render user data
  const renderAddedBy = (addedBy) => {
    if (!addedBy) return "N/A";
    if (typeof addedBy === "string") return addedBy;
    if (typeof addedBy === "object") {
      // Return the name if available, otherwise email or any identifier that makes sense
      return addedBy.firstName && addedBy.lastName
        ? `${addedBy.firstName} ${addedBy.lastName}`
        : addedBy.email || addedBy._id || "Unknown";
    }
    return "Unknown";
  };

  // Format date as MM/DD/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Get status specific color
  const getStatusColor = (status) => {
    return status === 1 ? "#4caf50" : "#f44336";
  };

  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#f4f6f9", minHeight: "100vh" }}
    >
      <CssBaseline />
      <Header
        sidebarOpen={sidebarOpen}
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        userName={userName}
      />
      <Sidebar
        sidebarOpen={sidebarOpen}
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        handleSidebarToggle={handleSidebarToggle}
        handleLogout={handleLogout}
        navigate={navigate}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 80}px)` },
          transition: "width 0.3s",
          mt: 8,
        }}
      >
        {/* Header Card */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)",
            boxShadow: "0 8px 16px rgba(26, 35, 126, 0.2)",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.5px",
                  mb: 1,
                }}
              >
                Tenant Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenTenantForm}
              sx={{
                bgcolor: "white",
                color: "#1a237e",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                fontWeight: "600",
                px: 3,
                py: 1.5,
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                textTransform: "none",
                transition: "all 0.3s ease",
                letterSpacing: "0.5px",
              }}
            >
              Add New Tenant
            </Button>
          </CardContent>
        </Card>

        {/* Search and Rows per page */}
        <Card
          elevation={2}
          sx={{
            mb: 3,
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              "&:last-child": { pb: 2 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                placeholder="Search Tenants..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                  sx: {
                    borderRadius: "12px",
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                sx={{
                  width: "300px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f1f3f4",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#e8eaed",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Rows per page:
                </Typography>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e0e0e0",
                    cursor: "pointer",
                    backgroundColor: "#f1f3f4",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                  }}
                >
                  {[5, 10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "Poppins, sans-serif" }}
            >
              Showing{" "}
              {Math.min(
                (currentPage - 1) * rowsPerPage + 1,
                filteredData.length
              )}{" "}
              to {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </Typography>
          </CardContent>
        </Card>

        {/* Table */}
        <Card
          elevation={3}
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "white",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            transition: "box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            },
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f7fa" }}>
                  {[
                    { key: "property", label: "Property" },
                    { key: "firstName", label: "First Name" },
                    { key: "middleName", label: "Middle Name" },
                    { key: "lastName", label: "Last Name" },
                    { key: "room", label: "Room" },
                    { key: "dateOfBirth", label: "Date of Birth" },
                    { key: "signInDate", label: "Sign In Date" },
                    { key: "signOutDate", label: "Sign Out Date" },
                    { key: "addedBy", label: "Added By" },
                    { key: "createdAt", label: "Created At" },
                    { key: "status", label: "Status" },
                    { key: "actions", label: "Actions" },
                  ].map((column) => (
                    <TableCell
                      key={column.key}
                      onClick={() =>
                        column.key !== "actions" &&
                        column.key !== "status" &&
                        handleSort(column.key)
                      }
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                        color: "#37474f",
                        fontSize: "0.875rem",
                        py: 2.5,
                        cursor:
                          column.key !== "actions" && column.key !== "status"
                            ? "pointer"
                            : "default",
                        "&:hover":
                          column.key !== "actions" && column.key !== "status"
                            ? { bgcolor: "rgba(0, 0, 0, 0.04)" }
                            : {},
                        transition: "background-color 0.2s ease",
                        borderBottom: "2px solid #e0e0e0",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {column.label}
                        {sortConfig.key === column.key && (
                          <Typography
                            component="span"
                            sx={{ ml: 1, fontSize: "0.75rem" }}
                          >
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <div
                          className="loading-spinner"
                          style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid rgba(63, 81, 181, 0.2)",
                            borderRadius: "50%",
                            borderTop: "4px solid #3f51b5",
                            animation: "spin 1s linear infinite",
                          }}
                        ></div>
                        <Typography
                          color="primary"
                          sx={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Loading tenant data...
                        </Typography>
                        <style>{`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}</style>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      align="center"
                      sx={{
                        py: 4,
                        color: "error.main",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <CloseIcon color="error" />
                        {error}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 48, color: "#bdbdbd" }} />
                        <Typography
                          color="text.secondary"
                          sx={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          No tenant data available
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={handleOpenTenantForm}
                          sx={{
                            mt: 1,
                            borderRadius: "8px",
                            textTransform: "none",
                          }}
                        >
                          Add Tenant
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        "&:hover": { bgcolor: "#f9fafc" },
                        transition: "background-color 0.2s ease",
                        borderLeft: "4px solid transparent",
                        ":hover": {
                          borderLeft: `4px solid ${getStatusColor(row.status)}`,
                          bgcolor: "#f5f7fa",
                        },
                      }}
                    >
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {row.property ? row.property.address : "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {row.personalDetails.firstName}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {row.personalDetails.middleName}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {row.personalDetails.lastName}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {row.roomNumber}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {formatDate(row.personalDetails.dateOfBirth)}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {formatDate(row.signInDate)}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {formatDate(row.signOutDate)}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {renderAddedBy(row.addedBy)}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        {formatDate(row.createdAt)}
                      </TableCell>
                      <TableCell
                        sx={{ py: 2.5, fontFamily: "Poppins, sans-serif" }}
                      >
                        <Chip
                          label={row.status === 1 ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            fontFamily: "Poppins, sans-serif",
                            bgcolor: `${getStatusColor(row.status)}15`,
                            color: getStatusColor(row.status),
                            border: "none",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ display: "flex" }}>
                          <Tooltip title="Edit Tenant">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditClick(row)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(25, 118, 210, 0.1)",
                                  transform: "translateY(-2px)",
                                },
                                transition: "all 0.2s",
                                mr: 1,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Tenant">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(row)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(211, 47, 47, 0.1)",
                                  transform: "translateY(-2px)",
                                },
                                transition: "all 0.2s",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Report">
                            <IconButton
                              color="secondary"
                              onClick={() => handleDownloadReport(row)}
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(156, 39, 176, 0.1)",
                                  transform: "translateY(-2px)",
                                },
                                transition: "all 0.2s",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                              size="small"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Pagination */}
        <Card
          elevation={2}
          sx={{
            mt: 3,
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              py: 2,
              "&:last-child": { pb: 2 },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<SkipPreviousIcon />}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              sx={{
                minWidth: "130px",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: "Poppins, sans-serif",
                border: "1px solid #e0e0e0",
                color: currentPage === 1 ? "#bdbdbd" : "#3f51b5",
                "&:hover": {
                  borderColor: "#3f51b5",
                  backgroundColor: "rgba(63, 81, 181, 0.04)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Previous
            </Button>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: "8px",
                backgroundColor: "#f5f7fa",
                minWidth: "120px",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
              >
                Page{" "}
                <span style={{ fontWeight: 700, color: "#3f51b5" }}>
                  {currentPage}
                </span>{" "}
                of {totalPages}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              endIcon={<SkipNextIcon />}
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              sx={{
                minWidth: "130px",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: "Poppins, sans-serif",
                border: "1px solid #e0e0e0",
                color:
                  currentPage === totalPages || totalPages === 0
                    ? "#bdbdbd"
                    : "#3f51b5",
                "&:hover": {
                  borderColor: "#3f51b5",
                  backgroundColor: "rgba(63, 81, 181, 0.04)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Next
            </Button>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              fontWeight: 700,
              color: "#d32f2f",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontFamily: "Poppins, sans-serif",
              borderBottom: "1px solid #f0f0f0",
              pb: 2,
            }}
          >
            <DeleteIcon color="error" /> Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ mt: 2, pt: 2 }}>
            <DialogContentText
              id="alert-dialog-description"
              sx={{
                color: "#37474f",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Are you sure you want to delete{" "}
              {selectedTenant?.personalDetails
                ? `${selectedTenant.personalDetails.firstName} ${selectedTenant.personalDetails.lastName}`
                : "this tenant"}
              ? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              color="primary"
              variant="outlined"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              autoFocus
              sx={{
                borderRadius: "10px",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(211, 47, 47, 0.3)",
                  backgroundColor: "#c62828",
                },
                textTransform: "none",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                px: 3,
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tenant Form Dialog */}
        <Dialog
          open={openTenantForm}
          onClose={handleCloseTenantForm}
          maxWidth="md"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #f0f0f0",
              pb: 2,
              color: "#37474f",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {editMode ? (
                <>
                  <EditIcon color="primary" />
                  Edit Tenant
                </>
              ) : (
                <>
                  <AddIcon color="primary" />
                  Add New Tenant
                </>
              )}
            </Box>
            <IconButton
              onClick={handleCloseTenantForm}
              sx={{
                color: "#9e9e9e",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  color: "#757575",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <TenantForm
              onSuccess={handleFormSuccess}
              onClose={handleCloseTenantForm}
              initialData={editMode ? selectedTenant : null}
              editMode={editMode}
            />
          </DialogContent>
        </Dialog>

        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ fontFamily: "Poppins, sans-serif" }}
        />
      </Box>
    </Box>
  );
};

export default Tenants;
