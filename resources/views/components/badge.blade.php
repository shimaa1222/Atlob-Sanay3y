{{--
    استخدام:
    <x-badge type="pending" text="معلق" />
    Types: pending, approved, rejected, active, closed, success, danger, gray
--}}
@props(['type' => 'gray', 'text' => ''])


<span class="badge badge-{{ $type }}">{{ $text }}</span>