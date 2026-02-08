import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import authService from "../../utils/auth";
import { UPLOADS_URL } from "../../utils/api";

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [profileData, setProfileData] = useState({
        fullName: "",
        fullSurname: "",
        phonePrefix: "+52",
        phoneNumber: "",
        city: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [imagePreview, setImagePreview] = useState("");
    const [imageData, setImageData] = useState("");

    useEffect(() => {
        if (user) {
            // Parse phone from combined format (e.g., "+521234567890")
            let phonePrefix = "+52";
            let phoneNumber = "";
            if (user.phone) {
                // Common phone prefixes
                const prefixes = ["+1", "+52", "+44", "+49"];
                for (const prefix of prefixes) {
                    if (user.phone.startsWith(prefix)) {
                        phonePrefix = prefix;
                        phoneNumber = user.phone.slice(prefix.length);
                        break;
                    }
                }
            }

            setProfileData({
                fullName: user.fullName || "",
                fullSurname: user.fullSurname || "",
                phonePrefix: phonePrefix,
                phoneNumber: phoneNumber,
                city: user.city || "",
            });
            setImagePreview(user.avatar ? `${UPLOADS_URL}/uploads/users/${user.avatar}` : "");
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImagePreview(reader.result);
                setImageData(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                s_full_name: profileData.fullName,
                s_full_surname: profileData.fullSurname,
                s_phone_prefix: profileData.phonePrefix,
                s_phone_number: profileData.phoneNumber,
                s_city: profileData.city,
                ...(imageData && { image_data: imageData }),
            };

            const result = await authService.apiRequest("/users/profile", {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            if (result.success) {
                await refreshUser();
                setSuccess("Perfil actualizado correctamente!");
                setImageData("");
            } else {
                setError(result.message || "No se pudo actualizar el perfil");
            }
        } catch (err) {
            setError("Error al actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            const result = await authService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (result.success) {
                setSuccess("Contraseña cambiada correctamente!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                setError(result.message || "No se pudo cambiar la contraseña");
            }
        } catch (err) {
            setError("Error al cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="container">
                <h1 className="settings-title">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Configuración
                </h1>

                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {/* Profile Section */}
                <div className="settings-card">
                    <h2 className="settings-section-title">Información del Perfil</h2>

                    <form onSubmit={handleProfileSubmit}>
                        {/* Avatar Upload */}
                        <div className="settings-avatar-section">
                            <div className="settings-avatar">
                                <div className="avatar avatar-xl avatar-bordered">
                                    <img
                                        src={imagePreview || "/default-avatar.png"}
                                        alt="Profile"
                                        onError={(e) => { e.target.src = "/default-avatar.png"; }}
                                    />
                                </div>
                            </div>
                            <div className="settings-avatar-actions">
                                <label className="btn btn-outline-primary btn-sm">
                                    Cambiar Foto
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="d-none"
                                    />
                                </label>
                                <p className="settings-avatar-hint">JPG, PNG or GIF. Max 5MB.</p>
                            </div>
                        </div>

                        <div className="settings-form-grid">
                            <div className="form-group">
                                <label htmlFor="fullName">Nombre</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={profileData.fullName}
                                    onChange={handleProfileChange}
                                    className="form-control"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fullSurname">Apellido</label>
                                <input
                                    type="text"
                                    id="fullSurname"
                                    name="fullSurname"
                                    value={profileData.fullSurname}
                                    onChange={handleProfileChange}
                                    className="form-control"
                                    placeholder="Tu apellido"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phoneNumber">Número de Teléfono</label>
                                <div className="phone-input-group">
                                    <select
                                        name="phonePrefix"
                                        value={profileData.phonePrefix}
                                        onChange={handleProfileChange}
                                        className="form-control phone-prefix"
                                    >
                                        <option value="+1">+1</option>
                                        <option value="+52">+52</option>
                                        <option value="+44">+44</option>
                                        <option value="+49">+49</option>
                                    </select>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={profileData.phoneNumber}
                                        onChange={handleProfileChange}
                                        className="form-control"
                                        placeholder="Número de teléfono"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">Ciudad</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={profileData.city}
                                    onChange={handleProfileChange}
                                    className="form-control"
                                    placeholder="Tu ciudad"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="settings-card">
                    <h2 className="settings-section-title">Cambiar Contraseña</h2>

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="settings-form-grid single-column">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Contraseña Actual</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Cambiando..." : "Cambiar Contraseña"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
