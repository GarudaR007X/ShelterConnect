import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Checkbox,
  Typography,
  MenuItem,
  Divider,
  Select,
  InputLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-toastify";
import { createTenant, updateTenantById } from "../api/tenantApi";
import { getAllProperties } from "../api/propertyApi";

// Signature Pad Component
const SignaturePad = ({ onSave, initialSignature }) => {
  const [showPad, setShowPad] = useState(false);
  const signatureRef = useRef(null);

  const handleSave = () => {
    if (signatureRef.current.isEmpty()) {
      toast.warning("Please provide a signature");
      return;
    }

    const signature = signatureRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    onSave(signature);
    setShowPad(false);
  };

  const handleClear = () => {
    signatureRef.current.clear();
  };

  return (
    <Box>
      {showPad ? (
        <Box>
          <Box sx={{ border: "1px solid #ccc", mb: 1 }}>
            <SignatureCanvas
              ref={signatureRef}
              penColor="black"
              canvasProps={{
                width: 300,
                height: 100,
                className: "sigCanvas",
              }}
            />
          </Box>
          <Box display="flex" gap={1}>
            <Button variant="outlined" size="small" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="contained" size="small" onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowPad(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          {initialSignature ? (
            <Box sx={{ mb: 1 }}>
              <img
                src={initialSignature}
                alt="Signature"
                style={{ maxWidth: 200, maxHeight: 80 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPad(true)}
                sx={{ ml: 2 }}
              >
                Change Signature
              </Button>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => setShowPad(true)}>
              Add Signature
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

const TenantForm = ({ onSuccess, onClose, initialData, editMode }) => {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState("panel1");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Initialize form data with empty values or provided initial data
  const [formData, setFormData] = useState({
    property: "",
    roomNumber: "",
    signInDate: "",
    signOutDate: "",
    dateOfAssessment: "",
    preferredArea: "",
    ethnicOrigin: "",
    religion: "",
    sexualOrientation: "",
    sourceOfIncome: "",
    benefits: "",
    totalAmount: "",
    paymentFrequency: "",
    debts: false,
    debtDetails: "",
    gamblingIssues: false,
    gamblingDetails: "",
    criminalRecords: false,
    offenceDetails: {
      nature: "",
      date: "",
      sentence: "",
    },
    supportNeeds: [],
    fullCheckCompleted: false,
    physicalHealthConditions: false,
    mentalHealthConditions: false,
    diagnosedMentalHealth: false,
    legalStatus: "",
    prescribedMedication: false,
    selfHarmOrSuicidalThoughts: false,
    prisonHistory: false,
    legalOrders: false,
    benefitsClaimed: "",
    drugUse: false,
    riskAssessment: [],
    familySupport: false,
    supportWorkerSignature: "",
    tenantSignature: "",
    personalDetails: {
      title: "",
      firstName: "",
      middleName: "",
      lastName: "",
      nationalInsuranceNumber: "",
      maritalStatus: "",
      height: "",
      shoeSize: "",
      clothingSize: "",
      eyeColor: "",
      gender: "",
      contactNumber: "",
      email: "",
      signupEmail: "",
      claimReferenceNumber: "",
      skinTone: "",
      hairColor: "",
      dateOfBirth: "",
      placeOfBirth: "",
      currentSituation: "",
      hasVehicle: false,
      distinguishingMarks: false,
      employerOrCollegeDetails: false,
      movedLast12Months: false,
      enteredUKLast2Years: false,
      partnerLivingWithYou: false,
      bereavementOrSeparation: false,
      relevantCircumstances: false,
      rentAffordableWhenMoved: false,
      multiAgencyProtectionPlan: false,
      homelessHostelFor3Months: false,
      nextOfKinInfo: false,
      gpInfo: false,
      requireNilIncomeForm: false,
      claimBackdated: false,
      otherCharges: "",
      shelteredAccommodation: false,
      photoUploaded: false,
      proofOfBenefitUploaded: false,
      studentStatus: false,
      incapableOfWork: false,
      registeredBlind: false,
      carerAllowanceReceived: false,
      overnightCareRequired: false,
      fosterCarer: false,
      currentlyAbsentFromHome: false,
      claimedHousingBenefitBefore: false,
      expectedIncomeChangeNext6Months: false,
      expectedExpenseChangeNext6Months: false,
      ukEntryDate: "",
    },
    termsAndConditions: {
      supportChecklist: { agreed: false, signature: "" },
      licenseToOccupy: { agreed: false, signature: "" },
      weeklyServiceCharge: { agreed: false, signature: "" },
      missingPersonForm: { agreed: false, signature: "" },
      tenantPhotographicID: { agreed: false, signature: "" },
      personalDetailsAgreement: { agreed: false, signature: "" },
      licenseChargePayments: { agreed: false, signature: "" },
      fireEvacuationProcedure: { agreed: false, signature: "" },
      supportAgreement: { agreed: false, signature: "" },
      complaintsProcedure: { agreed: false, signature: "" },
      confidentialityWaiver: { agreed: false, signature: "" },
      nilIncomeFormAgreement: { agreed: false, signature: "" },
      authorizationForm: { agreed: false, signature: "" },
      supportServices: { agreed: false, signature: "" },
      staffAgreement: { agreed: false, signature: "" },
    },
    status: 1,
  });

  // Fetch properties and get the list of occupied rooms
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await getAllProperties();

        if (response && response.success && Array.isArray(response.data)) {
          setProperties(response.data);

          // If we have initialData, find the property it belongs to
          if (initialData && initialData.property) {
            const property = response.data.find(
              (p) => p._id === initialData.property
            );
            if (property) {
              setSelectedProperty(property);

              // Get occupied rooms for this property
              try {
                // You'll need to implement or import this API function
                const tenantsResponse = await getTenantsByProperty(
                  property._id
                );
                if (tenantsResponse && tenantsResponse.success) {
                  // Filter out the current tenant's room if in edit mode
                  const occupiedRoomNumbers = tenantsResponse.data
                    .filter((tenant) =>
                      editMode ? tenant._id !== initialData._id : true
                    )
                    .map((tenant) => tenant.roomNumber);
                  setOccupiedRooms(occupiedRoomNumbers);

                  // Generate available room numbers
                  generateRoomNumbers(
                    property.noOfBedrooms,
                    occupiedRoomNumbers
                  );
                }
              } catch (error) {
                console.error("Error fetching tenants:", error);
                toast.error("Failed to load room occupancy data");
              }
            }
          }
        } else {
          setProperties([]);
          console.error("Property data is not in expected format:", response);
          toast.warning("Unable to load property list properly");
        }
      } catch (error) {
        console.error("Error loading properties:", error);
        toast.error("Failed to load properties");
        setProperties([]);
      }
    };

    const initializeForm = () => {
      if (initialData && editMode) {
        // Convert date strings to the format expected by the form
        const formattedData = { ...initialData };

        // Format dates if they exist
        if (formattedData.signInDate) {
          formattedData.signInDate = new Date(formattedData.signInDate)
            .toISOString()
            .split("T")[0];
        }
        if (formattedData.signOutDate) {
          formattedData.signOutDate = new Date(formattedData.signOutDate)
            .toISOString()
            .split("T")[0];
        }
        if (formattedData.dateOfAssessment) {
          formattedData.dateOfAssessment = new Date(
            formattedData.dateOfAssessment
          )
            .toISOString()
            .split("T")[0];
        }

        // Format personal details dates
        if (formattedData.personalDetails) {
          if (formattedData.personalDetails.dateOfBirth) {
            formattedData.personalDetails.dateOfBirth = new Date(
              formattedData.personalDetails.dateOfBirth
            )
              .toISOString()
              .split("T")[0];
          }
          if (formattedData.personalDetails.ukEntryDate) {
            formattedData.personalDetails.ukEntryDate = new Date(
              formattedData.personalDetails.ukEntryDate
            )
              .toISOString()
              .split("T")[0];
          }
        }

        // Format offense details date
        if (formattedData.offenceDetails && formattedData.offenceDetails.date) {
          formattedData.offenceDetails.date = new Date(
            formattedData.offenceDetails.date
          )
            .toISOString()
            .split("T")[0];
        }

        // Ensure all Boolean values are properly set
        formattedData.debts = !!formattedData.debts;
        formattedData.gamblingIssues = !!formattedData.gamblingIssues;
        formattedData.criminalRecords = !!formattedData.criminalRecords;
        formattedData.fullCheckCompleted = !!formattedData.fullCheckCompleted;
        formattedData.physicalHealthConditions =
          !!formattedData.physicalHealthConditions;
        formattedData.mentalHealthConditions =
          !!formattedData.mentalHealthConditions;
        formattedData.diagnosedMentalHealth =
          !!formattedData.diagnosedMentalHealth;
        formattedData.prescribedMedication =
          !!formattedData.prescribedMedication;
        formattedData.selfHarmOrSuicidalThoughts =
          !!formattedData.selfHarmOrSuicidalThoughts;
        formattedData.prisonHistory = !!formattedData.prisonHistory;
        formattedData.legalOrders = !!formattedData.legalOrders;
        formattedData.drugUse = !!formattedData.drugUse;
        formattedData.familySupport = !!formattedData.familySupport;

        // Ensure arrays are properly initialized
        formattedData.supportNeeds = Array.isArray(formattedData.supportNeeds)
          ? formattedData.supportNeeds
          : [];
        formattedData.riskAssessment = Array.isArray(
          formattedData.riskAssessment
        )
          ? formattedData.riskAssessment
          : [];

        // Initialize personalDetails object if it doesn't exist
        if (!formattedData.personalDetails) {
          formattedData.personalDetails = {};
        }

        // Initialize offenceDetails object if it doesn't exist
        if (!formattedData.offenceDetails) {
          formattedData.offenceDetails = {
            nature: "",
            date: "",
            sentence: "",
          };
        }

        // Initialize termsAndConditions object with all entries if it doesn't exist or is incomplete
        if (!formattedData.termsAndConditions) {
          formattedData.termsAndConditions = {
            supportChecklist: { agreed: false, signature: "" },
            licenseToOccupy: { agreed: false, signature: "" },
            weeklyServiceCharge: { agreed: false, signature: "" },
            missingPersonForm: { agreed: false, signature: "" },
            tenantPhotographicID: { agreed: false, signature: "" },
            personalDetailsAgreement: { agreed: false, signature: "" },
            licenseChargePayments: { agreed: false, signature: "" },
            fireEvacuationProcedure: { agreed: false, signature: "" },
            supportAgreement: { agreed: false, signature: "" },
            complaintsProcedure: { agreed: false, signature: "" },
            confidentialityWaiver: { agreed: false, signature: "" },
            nilIncomeFormAgreement: { agreed: false, signature: "" },
            authorizationForm: { agreed: false, signature: "" },
            supportServices: { agreed: false, signature: "" },
            staffAgreement: { agreed: false, signature: "" },
          };
        } else {
          // Make sure all terms and conditions objects exist
          const allTerms = [
            "supportChecklist",
            "licenseToOccupy",
            "weeklyServiceCharge",
            "missingPersonForm",
            "tenantPhotographicID",
            "personalDetailsAgreement",
            "licenseChargePayments",
            "fireEvacuationProcedure",
            "supportAgreement",
            "complaintsProcedure",
            "confidentialityWaiver",
            "nilIncomeFormAgreement",
            "authorizationForm",
            "supportServices",
            "staffAgreement",
          ];

          allTerms.forEach((term) => {
            if (!formattedData.termsAndConditions[term]) {
              formattedData.termsAndConditions[term] = {
                agreed: false,
                signature: "",
              };
            }
          });
        }

        setFormData(formattedData);
      }
    };

    // Load properties first, then initialize the form
    loadProperties().then(() => {
      initializeForm();
    });
  }, [initialData, editMode]);

  // Generate available room numbers based on property's noOfBedrooms
  const generateRoomNumbers = (noOfBedrooms, occupiedRooms = []) => {
    if (!noOfBedrooms || noOfBedrooms <= 0) {
      setAvailableRooms([]);
      return;
    }

    const rooms = [];
    for (let i = 1; i <= noOfBedrooms; i++) {
      // Add to available rooms if it's not occupied (or it's the room of the current tenant in edit mode)
      if (!occupiedRooms.includes(i.toString())) {
        rooms.push(i.toString());
      }
    }
    setAvailableRooms(rooms);
  };

  // Handle property selection change
  const handlePropertyChange = async (e) => {
    const propertyId = e.target.value;
    const selectedProp = properties.find((p) => p._id === propertyId);

    if (selectedProp) {
      setSelectedProperty(selectedProp);

      // Reset room number when property changes
      setFormData((prev) => ({
        ...prev,
        property: propertyId,
        roomNumber: "",
      }));

      // Get occupied rooms for this property
      try {
        const tenantsResponse = await getTenantsByProperty(propertyId);
        if (tenantsResponse && tenantsResponse.success) {
          // Get occupied room numbers
          const occupiedRoomNumbers = tenantsResponse.data.map(
            (tenant) => tenant.roomNumber
          );
          setOccupiedRooms(occupiedRoomNumbers);

          // Generate available room numbers based on the property's bedroom count
          generateRoomNumbers(selectedProp.noOfBedrooms, occupiedRoomNumbers);
        }
      } catch (error) {
        console.error("Error fetching tenants:", error);
        toast.error("Failed to load room occupancy data");

        // Still generate room numbers even if tenant data fetch fails
        generateRoomNumbers(selectedProp.noOfBedrooms);
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    // Basic validation
    if (!formData.property) newErrors.property = "Property is required";
    if (!formData.roomNumber) newErrors.roomNumber = "Room number is required";
    if (!formData.signInDate) newErrors.signInDate = "Sign in date is required";
    if (!formData.dateOfAssessment)
      newErrors.dateOfAssessment = "Assessment date is required";
    // Personal details validation
    if (!formData.personalDetails.firstName)
      newErrors["personalDetails.firstName"] = "First name is required";
    if (!formData.personalDetails.lastName)
      newErrors["personalDetails.lastName"] = "Last name is required";
    if (!formData.personalDetails.nationalInsuranceNumber)
      newErrors["personalDetails.nationalInsuranceNumber"] =
        "NI number is required";
    if (!formData.personalDetails.gender)
      newErrors["personalDetails.gender"] = "Gender is required";
    if (!formData.personalDetails.dateOfBirth)
      newErrors["personalDetails.dateOfBirth"] = "Date of birth is required";
    if (!formData.personalDetails.maritalStatus)
      newErrors["personalDetails.maritalStatus"] = "Marital status is required";
    // Validation for other required fields
    if (formData.debts === null || formData.debts === undefined)
      newErrors.debts = "This field is required";
    if (
      formData.fullCheckCompleted === null ||
      formData.fullCheckCompleted === undefined
    )
      newErrors.fullCheckCompleted = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const path = name.split(".");
    if (path.length === 3) {
      // For nested properties like termsAndConditions.supportChecklist.agreed
      setFormData((prev) => ({
        ...prev,
        [path[0]]: {
          ...prev[path[0]],
          [path[1]]: {
            ...prev[path[0]][path[1]],
            [path[2]]: type === "checkbox" ? checked : value,
          },
        },
      }));
    } else if (path.length === 2) {
      // For properties like personalDetails.firstName
      setFormData((prev) => ({
        ...prev,
        [path[0]]: {
          ...prev[path[0]],
          [path[1]]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      // For top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleArrayChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOffenceDetailsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      offenceDetails: {
        ...prev.offenceDetails,
        [field]: value,
      },
    }));
  };

  const handleSignatureChange = (fieldPath, signature) => {
    const path = fieldPath.split(".");
    if (path.length === 2) {
      // For signatures in termsAndConditions object
      setFormData((prev) => ({
        ...prev,
        [path[0]]: {
          ...prev[path[0]],
          [path[1]]: {
            ...prev[path[0]][path[1]],
            signature,
          },
        },
      }));
    } else {
      // For direct signature fields
      setFormData((prev) => ({
        ...prev,
        [fieldPath]: signature,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    setLoading(true);
    try {
      if (editMode && initialData._id) {
        await updateTenantById(initialData._id, formData);
        toast.success("Tenant updated successfully!");
      } else {
        await createTenant(formData);
        toast.success("Tenant added successfully!");
      }
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Basic Information Section */}
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleAccordionChange("panel1")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Basic Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.property}>
                  <InputLabel id="property-label">Property *</InputLabel>
                  <Select
                    labelId="property-label"
                    name="property"
                    value={formData.property}
                    onChange={handlePropertyChange}
                    label="Property *"
                  >
                    {properties.map((property) => (
                      <MenuItem key={property._id} value={property._id}>
                        {property.address || "Unnamed Property"}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.property && (
                    <Typography color="error" variant="caption">
                      {errors.property}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.roomNumber}>
                  <InputLabel id="room-number-label">Room Number *</InputLabel>
                  <Select
                    labelId="room-number-label"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    label="Room Number *"
                    disabled={!selectedProperty || availableRooms.length === 0}
                  >
                    {availableRooms.map((room) => (
                      <MenuItem key={room} value={room}>
                        Room {room}
                      </MenuItem>
                    ))}
                    {/* Show current room in edit mode even if it's now occupied */}
                    {editMode &&
                      formData.roomNumber &&
                      !availableRooms.includes(formData.roomNumber) && (
                        <MenuItem value={formData.roomNumber}>
                          Room {formData.roomNumber} (Current)
                        </MenuItem>
                      )}
                  </Select>
                  {errors.roomNumber && (
                    <Typography color="error" variant="caption">
                      {errors.roomNumber}
                    </Typography>
                  )}
                  {selectedProperty && availableRooms.length === 0 && (
                    <Typography color="error" variant="caption">
                      No available rooms in this property
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sign In Date *"
                  type="date"
                  name="signInDate"
                  InputLabelProps={{ shrink: true }}
                  value={formData.signInDate}
                  onChange={handleChange}
                  error={!!errors.signInDate}
                  helperText={errors.signInDate}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sign Out Date"
                  type="date"
                  name="signOutDate"
                  InputLabelProps={{ shrink: true }}
                  value={formData.signOutDate || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Date of Assessment *"
                  type="date"
                  name="dateOfAssessment"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfAssessment}
                  onChange={handleChange}
                  error={!!errors.dateOfAssessment}
                  helperText={errors.dateOfAssessment}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preferred Area"
                  name="preferredArea"
                  value={formData.preferredArea || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ethnic Origin</InputLabel>
                  <Select
                    name="ethnicOrigin"
                    value={formData.ethnicOrigin || ""}
                    onChange={handleChange}
                    label="Ethnic Origin"
                  >
                    <MenuItem value="Option1">Option 1</MenuItem>
                    <MenuItem value="Option2">Option 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Religion</InputLabel>
                  <Select
                    name="religion"
                    value={formData.religion || ""}
                    onChange={handleChange}
                    label="Religion"
                  >
                    <MenuItem value="Option1">Option 1</MenuItem>
                    <MenuItem value="Option2">Option 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sexual Orientation</InputLabel>
                  <Select
                    name="sexualOrientation"
                    value={formData.sexualOrientation || ""}
                    onChange={handleChange}
                    label="Sexual Orientation"
                  >
                    <MenuItem value="Option1">Option 1</MenuItem>
                    <MenuItem value="Option2">Option 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Personal Details Section */}
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleAccordionChange("panel2")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Personal Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Title"
                  name="personalDetails.title"
                  value={formData.personalDetails?.title || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="First Name *"
                  name="personalDetails.firstName"
                  value={formData.personalDetails?.firstName || ""}
                  onChange={handleChange}
                  error={!!errors["personalDetails.firstName"]}
                  helperText={errors["personalDetails.firstName"]}
                  required
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  name="personalDetails.middleName"
                  value={formData.personalDetails?.middleName || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  name="personalDetails.lastName"
                  value={formData.personalDetails?.lastName || ""}
                  onChange={handleChange}
                  error={!!errors["personalDetails.lastName"]}
                  helperText={errors["personalDetails.lastName"]}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="National Insurance Number *"
                  name="personalDetails.nationalInsuranceNumber"
                  value={
                    formData.personalDetails?.nationalInsuranceNumber || ""
                  }
                  onChange={handleChange}
                  error={!!errors["personalDetails.nationalInsuranceNumber"]}
                  helperText={errors["personalDetails.nationalInsuranceNumber"]}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors["personalDetails.maritalStatus"]}
                >
                  <InputLabel>Marital Status *</InputLabel>
                  <Select
                    name="personalDetails.maritalStatus"
                    value={formData.personalDetails?.maritalStatus || ""}
                    onChange={handleChange}
                    label="Marital Status *"
                  >
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Divorced">Divorced</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                    <MenuItem value="Separated">Separated</MenuItem>
                    <MenuItem value="Civil Partnership">
                      Civil Partnership
                    </MenuItem>
                  </Select>
                  {errors["personalDetails.maritalStatus"] && (
                    <Typography color="error" variant="caption">
                      {errors["personalDetails.maritalStatus"]}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors["personalDetails.gender"]}
                >
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    name="personalDetails.gender"
                    value={formData.personalDetails?.gender || ""}
                    onChange={handleChange}
                    label="Gender *"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Non-binary">Non-binary</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">
                      Prefer not to say
                    </MenuItem>
                  </Select>
                  {errors["personalDetails.gender"] && (
                    <Typography color="error" variant="caption">
                      {errors["personalDetails.gender"]}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Date of Birth *"
                  type="date"
                  name="personalDetails.dateOfBirth"
                  InputLabelProps={{ shrink: true }}
                  value={formData.personalDetails?.dateOfBirth || ""}
                  onChange={handleChange}
                  error={!!errors["personalDetails.dateOfBirth"]}
                  helperText={errors["personalDetails.dateOfBirth"]}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Place of Birth"
                  name="personalDetails.placeOfBirth"
                  value={formData.personalDetails?.placeOfBirth || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="personalDetails.contactNumber"
                  value={formData.personalDetails?.contactNumber || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="personalDetails.email"
                  type="email"
                  value={formData.personalDetails?.email || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Signup Email"
                  name="personalDetails.signupEmail"
                  type="email"
                  value={formData.personalDetails?.signupEmail || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  name="personalDetails.height"
                  type="number"
                  value={formData.personalDetails?.height || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Shoe Size"
                  name="personalDetails.shoeSize"
                  type="number"
                  value={formData.personalDetails?.shoeSize || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Clothing Size"
                  name="personalDetails.clothingSize"
                  value={formData.personalDetails?.clothingSize || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Eye Color"
                  name="personalDetails.eyeColor"
                  value={formData.personalDetails?.eyeColor || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Hair Color"
                  name="personalDetails.hairColor"
                  value={formData.personalDetails?.hairColor || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Skin Tone"
                  name="personalDetails.skinTone"
                  value={formData.personalDetails?.skinTone || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Claim Reference Number"
                  name="personalDetails.claimReferenceNumber"
                  value={formData.personalDetails?.claimReferenceNumber || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Current Situation"
                  name="personalDetails.currentSituation"
                  value={formData.personalDetails?.currentSituation || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="UK Entry Date"
                  type="date"
                  name="personalDetails.ukEntryDate"
                  InputLabelProps={{ shrink: true }}
                  value={formData.personalDetails?.ukEntryDate || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Other Charges"
                  name="personalDetails.otherCharges"
                  value={formData.personalDetails?.otherCharges || ""}
                  onChange={handleChange}
                />
              </Grid>

              {/* Personal Details Checkboxes */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Additional Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.hasVehicle || false
                          }
                          onChange={handleChange}
                          name="personalDetails.hasVehicle"
                        />
                      }
                      label="Has Vehicle"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.distinguishingMarks ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.distinguishingMarks"
                        />
                      }
                      label="Has Distinguishing Marks"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails
                              ?.employerOrCollegeDetails || false
                          }
                          onChange={handleChange}
                          name="personalDetails.employerOrCollegeDetails"
                        />
                      }
                      label="Has Employer/College Details"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.movedLast12Months || false
                          }
                          onChange={handleChange}
                          name="personalDetails.movedLast12Months"
                        />
                      }
                      label="Moved in Last 12 Months"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.enteredUKLast2Years ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.enteredUKLast2Years"
                        />
                      }
                      label="Entered UK in Last 2 Years"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.partnerLivingWithYou ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.partnerLivingWithYou"
                        />
                      }
                      label="Partner Living With You"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.bereavementOrSeparation ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.bereavementOrSeparation"
                        />
                      }
                      label="Recent Bereavement or Separation"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.relevantCircumstances ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.relevantCircumstances"
                        />
                      }
                      label="Has Relevant Circumstances"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.rentAffordableWhenMoved ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.rentAffordableWhenMoved"
                        />
                      }
                      label="Rent Affordable When Moved"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails
                              ?.multiAgencyProtectionPlan || false
                          }
                          onChange={handleChange}
                          name="personalDetails.multiAgencyProtectionPlan"
                        />
                      }
                      label="Multi-Agency Protection Plan"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails
                              ?.homelessHostelFor3Months || false
                          }
                          onChange={handleChange}
                          name="personalDetails.homelessHostelFor3Months"
                        />
                      }
                      label="Homeless/Hostel for 3+ Months"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.nextOfKinInfo || false
                          }
                          onChange={handleChange}
                          name="personalDetails.nextOfKinInfo"
                        />
                      }
                      label="Next of Kin Info Provided"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.personalDetails?.gpInfo || false}
                          onChange={handleChange}
                          name="personalDetails.gpInfo"
                        />
                      }
                      label="GP Info Provided"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.requireNilIncomeForm ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.requireNilIncomeForm"
                        />
                      }
                      label="Requires Nil Income Form"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.claimBackdated || false
                          }
                          onChange={handleChange}
                          name="personalDetails.claimBackdated"
                        />
                      }
                      label="Claim Backdated"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.shelteredAccommodation ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.shelteredAccommodation"
                        />
                      }
                      label="Sheltered Accommodation"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.photoUploaded || false
                          }
                          onChange={handleChange}
                          name="personalDetails.photoUploaded"
                        />
                      }
                      label="Photo Uploaded"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.proofOfBenefitUploaded ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.proofOfBenefitUploaded"
                        />
                      }
                      label="Proof of Benefit Uploaded"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.studentStatus || false
                          }
                          onChange={handleChange}
                          name="personalDetails.studentStatus"
                        />
                      }
                      label="Student Status"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.incapableOfWork || false
                          }
                          onChange={handleChange}
                          name="personalDetails.incapableOfWork"
                        />
                      }
                      label="Incapable of Work"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.registeredBlind || false
                          }
                          onChange={handleChange}
                          name="personalDetails.registeredBlind"
                        />
                      }
                      label="Registered Blind"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.carerAllowanceReceived ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.carerAllowanceReceived"
                        />
                      }
                      label="Carer Allowance Received"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.overnightCareRequired ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.overnightCareRequired"
                        />
                      }
                      label="Overnight Care Required"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.fosterCarer || false
                          }
                          onChange={handleChange}
                          name="personalDetails.fosterCarer"
                        />
                      }
                      label="Foster Carer"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails?.currentlyAbsentFromHome ||
                            false
                          }
                          onChange={handleChange}
                          name="personalDetails.currentlyAbsentFromHome"
                        />
                      }
                      label="Currently Absent From Home"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails
                              ?.claimedHousingBenefitBefore || false
                          }
                          onChange={handleChange}
                          name="personalDetails.claimedHousingBenefitBefore"
                        />
                      }
                      label="Claimed Housing Benefit Before"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails
                              ?.expectedIncomeChangeNext6Months || false
                          }
                          onChange={handleChange}
                          name="personalDetails.expectedIncomeChangeNext6Months"
                        />
                      }
                      label="Expected Income Change (6 months)"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.personalDetails
                              ?.expectedExpenseChangeNext6Months || false
                          }
                          onChange={handleChange}
                          name="personalDetails.expectedExpenseChangeNext6Months"
                        />
                      }
                      label="Expected Expense Change (6 months)"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Financial Information Section */}
        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleAccordionChange("panel3")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Financial Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Source of Income"
                  name="sourceOfIncome"
                  value={formData.sourceOfIncome || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Benefits"
                  name="benefits"
                  value={formData.benefits || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Amount"
                  name="totalAmount"
                  type="number"
                  value={formData.totalAmount || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Frequency"
                  name="paymentFrequency"
                  value={formData.paymentFrequency || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Benefits Claimed"
                  name="benefitsClaimed"
                  value={formData.benefitsClaimed || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  required
                  error={!!errors.debts}
                >
                  <FormLabel component="legend">
                    Do you have any debts?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="debts"
                    value={formData.debts.toString()}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        debts: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                  {errors.debts && (
                    <Typography color="error" variant="caption">
                      {errors.debts}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {formData.debts && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Debt Details"
                    name="debtDetails"
                    multiline
                    rows={3}
                    value={formData.debtDetails || ""}
                    onChange={handleChange}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have gambling issues?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="gamblingIssues"
                    value={formData.gamblingIssues?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        gamblingIssues: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {formData.gamblingIssues && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Gambling Details"
                    name="gamblingDetails"
                    multiline
                    rows={3}
                    value={formData.gamblingDetails || ""}
                    onChange={handleChange}
                  />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Health and Legal Section */}
        <Accordion
          expanded={expanded === "panel4"}
          onChange={handleAccordionChange("panel4")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Health & Legal Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have any physical health conditions?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="physicalHealthConditions"
                    value={
                      formData.physicalHealthConditions?.toString() || "false"
                    }
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        physicalHealthConditions: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have any mental health conditions?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="mentalHealthConditions"
                    value={
                      formData.mentalHealthConditions?.toString() || "false"
                    }
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        mentalHealthConditions: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have any diagnosed mental health conditions?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="diagnosedMentalHealth"
                    value={
                      formData.diagnosedMentalHealth?.toString() || "false"
                    }
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        diagnosedMentalHealth: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Are you taking any prescribed medication?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="prescribedMedication"
                    value={formData.prescribedMedication?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        prescribedMedication: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Legal Status"
                  name="legalStatus"
                  value={formData.legalStatus || ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have a history of self-harm or suicidal thoughts?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="selfHarmOrSuicidalThoughts"
                    value={
                      formData.selfHarmOrSuicidalThoughts?.toString() || "false"
                    }
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        selfHarmOrSuicidalThoughts: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have any legal orders against you?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="legalOrders"
                    value={formData.legalOrders?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        legalOrders: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have a history of prison/custody?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="prisonHistory"
                    value={formData.prisonHistory?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        prisonHistory: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you use any drugs?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="drugUse"
                    value={formData.drugUse?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        drugUse: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have any criminal records?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="criminalRecords"
                    value={formData.criminalRecords?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        criminalRecords: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {formData.criminalRecords && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Nature of Offence"
                      value={formData.offenceDetails?.nature || ""}
                      onChange={(e) =>
                        handleOffenceDetailsChange("nature", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Date of Offence"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={formData.offenceDetails?.date || ""}
                      onChange={(e) =>
                        handleOffenceDetailsChange("date", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Sentence"
                      value={formData.offenceDetails?.sentence || ""}
                      onChange={(e) =>
                        handleOffenceDetailsChange("sentence", e.target.value)
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Support Needs Section */}
        <Accordion
          expanded={expanded === "panel5"}
          onChange={handleAccordionChange("panel5")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Support Needs & Risk Assessment
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Support Needs</InputLabel>
                  <Select
                    multiple
                    value={formData.supportNeeds || []}
                    onChange={(e) =>
                      handleArrayChange("supportNeeds", e.target.value)
                    }
                    renderValue={(selected) => selected.join(", ")}
                  >
                    <MenuItem value="Mental Health">Mental Health</MenuItem>
                    <MenuItem value="Physical Health">Physical Health</MenuItem>
                    <MenuItem value="Substance Misuse">
                      Substance Misuse
                    </MenuItem>
                    <MenuItem value="Financial Management">
                      Financial Management
                    </MenuItem>
                    <MenuItem value="Independent Living Skills">
                      Independent Living Skills
                    </MenuItem>
                    <MenuItem value="Education/Employment">
                      Education/Employment
                    </MenuItem>
                    <MenuItem value="Social Isolation">
                      Social Isolation
                    </MenuItem>
                    <MenuItem value="Housing">Housing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Risk Assessment</InputLabel>
                  <Select
                    multiple
                    value={formData.riskAssessment || []}
                    onChange={(e) =>
                      handleArrayChange("riskAssessment", e.target.value)
                    }
                    renderValue={(selected) => selected.join(", ")}
                  >
                    <MenuItem value="Self-Harm">Self-Harm</MenuItem>
                    <MenuItem value="Suicide">Suicide</MenuItem>
                    <MenuItem value="Violence">Violence</MenuItem>
                    <MenuItem value="Exploitation">Exploitation</MenuItem>
                    <MenuItem value="Arson">Arson</MenuItem>
                    <MenuItem value="Sexual Offending">
                      Sexual Offending
                    </MenuItem>
                    <MenuItem value="Drug/Alcohol Issues">
                      Drug/Alcohol Issues
                    </MenuItem>
                    <MenuItem value="Mental Health Crisis">
                      Mental Health Crisis
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  required
                  error={!!errors.fullCheckCompleted}
                >
                  <FormLabel component="legend">
                    Has a full background check been completed?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="fullCheckCompleted"
                    value={formData.fullCheckCompleted?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        fullCheckCompleted: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                  {errors.fullCheckCompleted && (
                    <Typography color="error" variant="caption">
                      {errors.fullCheckCompleted}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you have family support?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="familySupport"
                    value={formData.familySupport?.toString() || "false"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        familySupport: e.target.value === "true",
                      });
                    }}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Terms and Conditions Section */}
        <Accordion
          expanded={expanded === "panel6"}
          onChange={handleAccordionChange("panel6")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Terms & Conditions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {Object.entries(formData.termsAndConditions).map(
                ([key, value]) => (
                  <Grid item xs={12} key={key}>
                    <Box
                      sx={{
                        border: "1px solid #eee",
                        p: 2,
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value.agreed || false}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                termsAndConditions: {
                                  ...formData.termsAndConditions,
                                  [key]: {
                                    ...formData.termsAndConditions[key],
                                    agreed: e.target.checked,
                                  },
                                },
                              });
                            }}
                            name={`termsAndConditions.${key}.agreed`}
                          />
                        }
                        label={key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      />

                      {value.agreed && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Signature:
                          </Typography>
                          <SignaturePad
                            onSave={(signature) =>
                              handleSignatureChange(
                                `termsAndConditions.${key}`,
                                signature
                              )
                            }
                            initialSignature={value.signature}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Signatures Section */}
        <Accordion
          expanded={expanded === "panel7"}
          onChange={handleAccordionChange("panel7")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Signatures</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Tenant Signature:
                </Typography>
                <SignaturePad
                  onSave={(signature) =>
                    handleSignatureChange("tenantSignature", signature)
                  }
                  initialSignature={formData.tenantSignature}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Support Worker Signature:
                </Typography>
                <SignaturePad
                  onSave={(signature) =>
                    handleSignatureChange("supportWorkerSignature", signature)
                  }
                  initialSignature={formData.supportWorkerSignature}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Status Section */}
        <Accordion
          expanded={expanded === "panel8"}
          onChange={handleAccordionChange("panel8")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Status</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <MenuItem value={1}>Active</MenuItem>
                    <MenuItem value={0}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : editMode ? (
              "Update Tenant"
            ) : (
              "Create Tenant"
            )}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default TenantForm;