import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameCtrl;
  late TextEditingController _bioCtrl;
  late TextEditingController _locationCtrl;
  late TextEditingController _websiteCtrl;

  late Map<String, dynamic> _profile;
  bool _saving = false;
  bool _initialized = false;

  File? _avatarFile;
  File? _coverFile;
  String? _avatarPreview;
  String? _coverPreview;
  double _coverPosition = 50;
  bool _draggingCover = false;
  double _dragStartDy = 0;
  double _dragStartPos = 50;

  final _picker = ImagePicker();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      _profile =
          ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
      _nameCtrl = TextEditingController(text: _profile['name'] ?? '');
      _bioCtrl = TextEditingController(text: _profile['bio'] ?? '');
      _locationCtrl =
          TextEditingController(text: _profile['location'] ?? '');
      _websiteCtrl =
          TextEditingController(text: _profile['website'] ?? '');
      _avatarPreview = _profile['profile_picture'];
      _coverPreview = _profile['cover_photo'];
      _coverPosition =
          (_profile['cover_position'] ?? 50).toDouble();
      _initialized = true;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _bioCtrl.dispose();
    _locationCtrl.dispose();
    _websiteCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final picked =
        await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked != null) {
      setState(() {
        _avatarFile = File(picked.path);
        _avatarPreview = picked.path;
      });
    }
  }

  Future<void> _pickCover() async {
    final picked =
        await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked != null) {
      setState(() {
        _coverFile = File(picked.path);
        _coverPreview = picked.path;
        _coverPosition = 50;
      });
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      // Upload avatar if changed
      if (_avatarFile != null) {
        await ApiService.uploadProfilePicture(_avatarFile!);
      }
      // Upload cover if changed
      if (_coverFile != null) {
        await ApiService.uploadCoverPhoto(_coverFile!);
      }
      // Update profile fields
      await ApiService.updateProfile({
        'name': _nameCtrl.text.trim(),
        'bio': _bioCtrl.text.trim(),
        'location': _locationCtrl.text.trim(),
        'website': _websiteCtrl.text.trim(),
        'cover_position': _coverPosition.round(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated!'),
            backgroundColor: Color(0xFF22C55E),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save: $e'),
            backgroundColor: const Color(0xFFF87171),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  // ── Cover image widget with drag-to-reposition ──────────
  Widget _buildCover() {
    final isLocal = _coverFile != null;
    final hasImage = _coverPreview != null;

    return GestureDetector(
      onVerticalDragStart: hasImage
          ? (d) {
              _draggingCover = true;
              _dragStartDy = d.globalPosition.dy;
              _dragStartPos = _coverPosition;
            }
          : null,
      onVerticalDragUpdate: hasImage
          ? (d) {
              if (!_draggingCover) return;
              final delta = d.globalPosition.dy - _dragStartDy;
              final newPos =
                  (_dragStartPos - delta / 2).clamp(0.0, 100.0);
              setState(() => _coverPosition = newPos);
            }
          : null,
      onVerticalDragEnd: (_) => _draggingCover = false,
      child: Stack(
        children: [
          // Cover image
          Container(
            height: 200,
            width: double.infinity,
            color: const Color(0xFF18181B),
            child: hasImage
                ? (isLocal
                    ? Image.file(
                        File(_coverPreview!),
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: 200,
                        alignment: Alignment(
                            0, (_coverPosition - 50) / 50),
                      )
                    : Image.network(
                        _coverPreview!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: 200,
                        alignment: Alignment(
                            0, (_coverPosition - 50) / 50),
                      ))
                : const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.image_outlined,
                            color: Color(0xFF3F3F46), size: 40),
                        SizedBox(height: 8),
                        Text('No cover photo',
                            style: TextStyle(
                                color: Color(0xFF52525B),
                                fontSize: 13)),
                      ],
                    ),
                  ),
          ),

          // Dark overlay
          Container(
            height: 200,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0x44000000),
                  Color(0x88000000),
                ],
              ),
            ),
          ),

          // Drag hint + slider
          if (hasImage)
            Positioned(
              top: 12,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.open_with,
                            color: Colors.white, size: 14),
                        const SizedBox(width: 5),
                        Text(
                          'Drag to reposition · ${_coverPosition.round()}%',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 24),
                    child: Row(
                      children: [
                        const Text('Top',
                            style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10)),
                        Expanded(
                          child: Slider(
                            value: _coverPosition,
                            min: 0,
                            max: 100,
                            activeColor: const Color(0xFF2563EB),
                            inactiveColor: Colors.white24,
                            onChanged: (v) =>
                                setState(() => _coverPosition = v),
                          ),
                        ),
                        const Text('Bottom',
                            style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Buttons
          Positioned(
            bottom: 12,
            right: 12,
            child: Row(
              children: [
                if (hasImage)
                  GestureDetector(
                    onTap: () => setState(() {
                      _coverFile = null;
                      _coverPreview = null;
                    }),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.25),
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(
                            color: Colors.red.withOpacity(0.5)),
                      ),
                      child: const Text('Remove',
                          style: TextStyle(
                              color: Color(0xFFFCA5A5),
                              fontSize: 12,
                              fontWeight: FontWeight.w600)),
                    ),
                  ),
                GestureDetector(
                  onTap: _pickCover,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB).withOpacity(0.85),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.camera_alt_outlined,
                            color: Colors.white, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          hasImage ? 'Change Cover' : 'Upload Cover',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Avatar widget ────────────────────────────────────────
  Widget _buildAvatar() {
    final isLocal = _avatarFile != null;
    final hasImage = _avatarPreview != null;

    return Stack(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
                color: const Color(0xFF2563EB), width: 2.5),
            color: const Color(0xFF27272A),
          ),
          child: ClipOval(
            child: hasImage
                ? (isLocal
                    ? Image.file(File(_avatarPreview!),
                        fit: BoxFit.cover,
                        width: 90,
                        height: 90,
                        alignment: Alignment.topCenter)
                    : Image.network(
                        _avatarPreview!.contains('supabase')
                            ? '$_avatarPreview?width=400&height=400&resize=cover&gravity=north'
                            : _avatarPreview!,
                        fit: BoxFit.cover,
                        width: 90,
                        height: 90,
                      ))
                : Center(
                    child: Text(
                      (_profile['name'] ?? 'U')[0].toUpperCase(),
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w800),
                    ),
                  ),
          ),
        ),
        Positioned(
          bottom: 0,
          right: 0,
          child: GestureDetector(
            onTap: _pickAvatar,
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.black, width: 2),
              ),
              child: const Icon(Icons.camera_alt,
                  color: Colors.white, size: 14),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Edit Profile',
            style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w700)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Save',
                      style: TextStyle(
                          color: Color(0xFF2563EB),
                          fontWeight: FontWeight.w700,
                          fontSize: 15)),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFF27272A)),
        ),
      ),
      body: ListView(
        children: [
          // ── Cover photo ──
          _buildCover(),

          // ── Avatar overlapping cover bottom ──
          Transform.translate(
            offset: const Offset(16, -40),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _buildAvatar(),
                const Spacer(),
                // Remove avatar button
                if (_avatarPreview != null)
                  Padding(
                    padding: const EdgeInsets.only(right: 16, bottom: 4),
                    child: GestureDetector(
                      onTap: () => setState(
                          () => _avatarPreview = null),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(
                              color: Colors.red.withOpacity(0.4)),
                        ),
                        child: const Text('Remove photo',
                            style: TextStyle(
                                color: Color(0xFFFCA5A5),
                                fontSize: 12,
                                fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // ── Fields ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
            child: Column(
              children: [
                _buildField('Name', _nameCtrl),
                const SizedBox(height: 16),
                _buildField('Bio', _bioCtrl, maxLines: 3,
                    hint: 'Tell the world about yourself...'),
                const SizedBox(height: 16),
                _buildField('Location', _locationCtrl,
                    hint: 'City, Country',
                    icon: Icons.location_on_outlined),
                const SizedBox(height: 16),
                _buildField('Website', _websiteCtrl,
                    hint: 'https://yourwebsite.com',
                    icon: Icons.link),
                const SizedBox(height: 32),

                // Save button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _saving ? null : _save,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      disabledBackgroundColor:
                          const Color(0xFF2563EB).withOpacity(0.5),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _saving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : const Text('Save Changes',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(
    String label,
    TextEditingController ctrl, {
    int maxLines = 1,
    String? hint,
    IconData? icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                color: Color(0xFF71717A),
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5)),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white, fontSize: 15),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF52525B)),
            prefixIcon: icon != null
                ? Icon(icon, color: const Color(0xFF52525B), size: 18)
                : null,
            filled: true,
            fillColor: const Color(0xFF18181B),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: Color(0xFF3F3F46)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: Color(0xFF3F3F46)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: Color(0xFF2563EB), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}